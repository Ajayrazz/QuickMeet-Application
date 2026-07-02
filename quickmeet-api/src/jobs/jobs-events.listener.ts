import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import {
  BookingEvents,
  BookingCreatedEvent,
  QueueCompactedEvent,
} from '../modules/bookings/booking.events';

@Injectable()
export class JobsEventsListener {
  private readonly logger = new Logger(JobsEventsListener.name);

  constructor(
    @InjectQueue('reminders') private remindersQueue: Queue,
    private prisma: PrismaService,
  ) {}

  @OnEvent(BookingEvents.CREATED)
  async handleBookingCreated(event: BookingCreatedEvent) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: event.bookingId },
      include: { slot: true },
    });

    if (!booking) return;

    // Schedule 30 minutes before
    const slotTime = booking.slot.startTime.getTime();
    const reminderTime = slotTime - 30 * 60 * 1000;
    const delay = reminderTime - Date.now();

    if (delay > 0) {
      const job = await this.remindersQueue.add(
        'reminder',
        {
          bookingId: event.bookingId,
          slotId: event.slotId,
          userId: event.userId,
        },
        { delay },
      );

      await this.prisma.booking.update({
        where: { id: event.bookingId },
        data: { reminderJobId: job.id as string },
      });

      this.logger.log(
        `Scheduled reminder job ${job.id} for booking ${event.bookingId} in ${delay}ms`,
      );
    }
  }

  @OnEvent(BookingEvents.CANCELLED)
  @OnEvent(BookingEvents.SERVED)
  @OnEvent(BookingEvents.NO_SHOW)
  async handleBookingEnded(event: QueueCompactedEvent) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: event.removedBookingId },
      select: { reminderJobId: true },
    });

    if (booking && booking.reminderJobId) {
      await this.remindersQueue.remove(booking.reminderJobId);
      this.logger.log(
        `Removed reminder job ${booking.reminderJobId} for booking ${event.removedBookingId}`,
      );
    }
  }
}
