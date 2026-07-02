import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateBookingDto } from './dto/booking.dto';
import {
  BookingEvents,
  BookingCreatedEvent,
  QueueCompactedEvent,
} from './booking.events';
import {
  SlotFullException,
  DuplicateBookingException,
  SlotNotOpenException,
  ForbiddenResourceException,
} from '../../common/exceptions/domain.exceptions';
import {
  calculateQueuePosition,
  compactQueuePositions,
} from '../../common/utils/queue.util';
import { calculateETA } from '../../common/utils/eta.util';
import { BookingStatus, SlotStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    const booking = await this.prisma.$transaction(async (tx: any) => {
      // 1. Transactional Row Lock on the Slot
      // This prevents concurrent requests from double-booking when capacity is 1
      const slots = await tx.$queryRaw<
        {
          id: string;
          capacity: number;
          status: string;
          appointmentTypeId: string;
        }[]
      >`
        SELECT id, capacity, status, "appointmentTypeId" 
        FROM "Slot" 
        WHERE id = ${dto.slotId} 
        FOR UPDATE
      `;

      if (slots.length === 0) {
        throw new NotFoundException('Slot not found');
      }

      const slot = slots[0];

      if (slot.status !== SlotStatus.OPEN) {
        throw new SlotNotOpenException();
      }

      // 2. Fetch active bookings for this slot
      const activeBookings = await tx.booking.findMany({
        where: {
          slotId: slot.id,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_QUEUE] },
        },
        select: { id: true, userId: true, queuePosition: true },
      });

      // 3. Capacity Check
      if (activeBookings.length >= slot.capacity) {
        throw new SlotFullException();
      }

      // 4. Duplicate Check
      if (activeBookings.some((b: any) => b.userId === userId)) {
        throw new DuplicateBookingException();
      }

      // 5. Queue Position calculation
      const existingPositions = activeBookings
        .map((b: any) => b.queuePosition)
        .filter((p: any): p is number => p !== null);
      const queuePosition = calculateQueuePosition(existingPositions);

      // 6. Create Booking
      const newBooking = await tx.booking.create({
        data: {
          userId,
          slotId: slot.id,
          status: BookingStatus.CONFIRMED,
          queuePosition,
        },
      });

      // 7. Generate Signed QR Ticket
      const qrPayload = { bookingId: newBooking.id, slotId: slot.id };
      const qrCode = this.jwtService.sign(qrPayload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '24h',
      });

      return tx.booking.update({
        where: { id: newBooking.id },
        data: { qrCode },
      });
    });

    this.eventEmitter.emit(
      BookingEvents.CREATED,
      new BookingCreatedEvent(
        booking.id,
        booking.slotId,
        booking.userId,
        booking.queuePosition,
      ),
    );

    return booking;
  }

  async cancel(userId: string, bookingId: string, isAdmin: boolean) {
    return this.compactQueue(
      userId,
      bookingId,
      isAdmin,
      BookingStatus.CANCELLED,
      'cancelledAt',
      BookingEvents.CANCELLED,
    );
  }

  async serve(userId: string, bookingId: string) {
    return this.compactQueue(
      userId,
      bookingId,
      true,
      BookingStatus.SERVED,
      'servedAt',
      BookingEvents.SERVED,
    );
  }

  async noShow(userId: string, bookingId: string) {
    return this.compactQueue(
      userId,
      bookingId,
      true,
      BookingStatus.NO_SHOW,
      'cancelledAt',
      BookingEvents.NO_SHOW,
    );
  }

  private async compactQueue(
    userId: string,
    bookingId: string,
    isAdmin: boolean,
    targetStatus: BookingStatus,
    dateField: 'cancelledAt' | 'servedAt',
    eventName: string,
  ) {
    const eventPayload = await this.prisma.$transaction(async (tx: any) => {
      // 1. Lock the slot indirectly via booking (wait, we need to lock the slot row to safely compact)
      const targetBooking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { slot: { include: { appointmentType: true } } },
      });

      if (!targetBooking) throw new NotFoundException('Booking not found');

      // Ownership checks
      if (!isAdmin && targetBooking.userId !== userId) {
        throw new ForbiddenResourceException();
      }
      if (isAdmin && targetBooking.slot.appointmentType.adminId !== userId) {
        throw new ForbiddenResourceException();
      }
      if (
        ![BookingStatus.CONFIRMED, BookingStatus.IN_QUEUE].includes(
          targetBooking.status,
        )
      ) {
        throw new BadRequestException('Booking cannot be modified');
      }

      // Lock the slot
      await tx.$queryRaw`SELECT 1 FROM "Slot" WHERE id = ${targetBooking.slotId} FOR UPDATE`;

      const removedPosition = targetBooking.queuePosition!;

      // Fetch all active bookings to compact
      const activeBookings = await tx.booking.findMany({
        where: {
          slotId: targetBooking.slotId,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_QUEUE] },
        },
        select: { id: true, queuePosition: true },
      });

      const affectedBookings = compactQueuePositions(
        activeBookings as { id: string; queuePosition: number }[],
        removedPosition,
      );

      // Apply compaction updates
      for (const b of affectedBookings) {
        await tx.booking.update({
          where: { id: b.bookingId },
          data: { queuePosition: b.newPosition },
        });
      }

      // Update the target booking
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: targetStatus,
          queuePosition: null,
          [dateField]: new Date(),
        },
      });

      return new QueueCompactedEvent(
        targetBooking.slotId,
        targetBooking.id,
        removedPosition,
        affectedBookings,
      );
    });

    this.eventEmitter.emit(eventName, eventPayload);

    return { message: `Booking marked as ${targetStatus}` };
  }

  async findMyBookings(
    userId: string,
    status?: BookingStatus,
    page: number = 1,
    limit: number = 10,
  ) {
    const where: any = { userId };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { bookedAt: 'desc' },
        include: { slot: { include: { appointmentType: true } } },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(userId: string, id: string, isAdmin: boolean) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { slot: { include: { appointmentType: true } } },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (!isAdmin && booking.userId !== userId)
      throw new ForbiddenResourceException();
    if (isAdmin && booking.slot.appointmentType.adminId !== userId)
      throw new ForbiddenResourceException();

    return booking;
  }

  async getQueueSnapshot(slotId: string) {
    const slot = await this.prisma.slot.findUnique({
      where: { id: slotId },
      include: { appointmentType: true },
    });

    if (!slot) throw new NotFoundException('Slot not found');

    const bookings = await this.prisma.booking.findMany({
      where: {
        slotId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_QUEUE] },
      },
      select: { id: true, userId: true, queuePosition: true },
      orderBy: { queuePosition: 'asc' },
    });

    const avgDuration = slot.appointmentType.avgServiceDurationMinutes;

    return bookings.map((b: any) => ({
      bookingId: b.id,
      userId: b.userId,
      position: b.queuePosition,
      etaMinutes: calculateETA(b.queuePosition, avgDuration),
    }));
  }
}
