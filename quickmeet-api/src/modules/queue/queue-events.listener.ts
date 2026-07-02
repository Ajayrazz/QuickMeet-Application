import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QueueService } from './queue.service';
import { QueueGateway } from './queue.gateway';
import {
  BookingEvents,
  BookingCreatedEvent,
  QueueCompactedEvent,
} from '../bookings/booking.events';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class QueueEventsListener {
  private readonly logger = new Logger(QueueEventsListener.name);

  constructor(
    private queueService: QueueService,
    private queueGateway: QueueGateway,
    private notificationsService: NotificationsService,
  ) {}

  @OnEvent(BookingEvents.CREATED)
  async handleBookingCreated(event: BookingCreatedEvent) {
    this.logger.log(`Processing BookingCreatedEvent for slot ${event.slotId}`);

    // Rebuild cache
    const snapshot = await this.queueService.rebuildAndCacheSnapshot(
      event.slotId,
    );

    // Broadcast to room
    this.queueGateway.server
      .to(`slot:${event.slotId}`)
      .emit('queue:update', snapshot);

    // Send Notification
    await this.notificationsService.sendNotification(
      event.userId,
      'BOOKING_CREATED',
      'Booking Confirmed!',
      `You are now in the queue at position ${event.queuePosition}.`,
      event.bookingId,
    );
  }

  @OnEvent(BookingEvents.CANCELLED)
  @OnEvent(BookingEvents.SERVED)
  @OnEvent(BookingEvents.NO_SHOW)
  async handleQueueCompacted(event: QueueCompactedEvent) {
    this.logger.log(
      `Processing compaction for slot ${event.slotId} (removed pos ${event.removedPosition})`,
    );

    const snapshot = await this.queueService.rebuildAndCacheSnapshot(
      event.slotId,
    );
    this.queueGateway.server
      .to(`slot:${event.slotId}`)
      .emit('queue:update', snapshot);

    // Check if anyone reached position 1
    for (const b of event.affectedBookings) {
      if (b.newPosition === 1) {
        // Find the user ID from the snapshot
        const userSnapshot = snapshot.find((s) => s.bookingId === b.bookingId);
        if (userSnapshot) {
          const personalRoom = `user:${userSnapshot.userId}`;
          this.queueGateway.server.to(personalRoom).emit('queue:your-turn', {
            bookingId: b.bookingId,
            slotId: event.slotId,
          });

          await this.notificationsService.sendNotification(
            userSnapshot.userId,
            'YOUR_TURN',
            'It is your turn!',
            'Please head to the service desk now.',
            b.bookingId,
          );
        }
      } else if (b.newPosition <= 3) {
        // Optional: warn them if they are getting close
        const userSnapshot = snapshot.find((s) => s.bookingId === b.bookingId);
        if (userSnapshot) {
          await this.notificationsService.sendNotification(
            userSnapshot.userId,
            'QUEUE_NEAR',
            'You are almost up!',
            `You are now at position ${b.newPosition} in the queue.`,
            b.bookingId,
          );
        }
      }
    }
  }
}
