import { QueueService } from './queue.service';
import { QueueGateway } from './queue.gateway';
import { BookingCreatedEvent, QueueCompactedEvent } from '../bookings/booking.events';
import { NotificationsService } from '../notifications/notifications.service';
export declare class QueueEventsListener {
    private queueService;
    private queueGateway;
    private notificationsService;
    private readonly logger;
    constructor(queueService: QueueService, queueGateway: QueueGateway, notificationsService: NotificationsService);
    handleBookingCreated(event: BookingCreatedEvent): Promise<void>;
    handleQueueCompacted(event: QueueCompactedEvent): Promise<void>;
}
