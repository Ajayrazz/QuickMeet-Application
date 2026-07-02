import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSlotDto, UpdateSlotDto } from './dto/slot.dto';
import { ForbiddenResourceException } from '../../common/exceptions/domain.exceptions';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class SlotsService {
  constructor(private prisma: PrismaService) {}

  async create(adminId: string, dto: CreateSlotDto) {
    const aptType = await this.prisma.appointmentType.findUnique({
      where: { id: dto.appointmentTypeId },
    });

    if (!aptType) throw new NotFoundException('Appointment type not found');
    if (aptType.adminId !== adminId) throw new ForbiddenResourceException();

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    const now = new Date();

    if (startTime < now) {
      throw new BadRequestException('Start time must be in the future');
    }
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    return this.prisma.slot.create({
      data: {
        appointmentTypeId: dto.appointmentTypeId,
        startTime,
        endTime,
        capacity: dto.capacity,
      },
    });
  }

  async update(adminId: string, id: string, dto: UpdateSlotDto) {
    const slot = await this.prisma.slot.findUnique({
      where: { id },
      include: { appointmentType: true },
    });

    if (!slot) throw new NotFoundException('Slot not found');
    if (slot.appointmentType.adminId !== adminId)
      throw new ForbiddenResourceException();

    return this.prisma.slot.update({
      where: { id },
      data: dto,
    });
  }

  async findByAppointmentTypeAndDate(appointmentTypeId: string, date: string) {
    // date in format YYYY-MM-DD
    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);

    const slots = await this.prisma.slot.findMany({
      where: {
        appointmentTypeId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        bookings: {
          where: {
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_QUEUE] },
          },
          select: { id: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return slots.map((slot: any) => {
      const activeBookingsCount = slot.bookings.length;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { bookings, ...slotDetails } = slot;
      return {
        ...slotDetails,
        availableCapacity: slot.capacity - activeBookingsCount,
      };
    });
  }
}
