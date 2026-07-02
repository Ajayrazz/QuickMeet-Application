import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { BookingCreatedEvent, QueueCompactedEvent } from '../modules/bookings/booking.events';
export declare class JobsEventsListener {
    private remindersQueue;
    private prisma;
    private readonly logger;
    constructor(remindersQueue: Queue, prisma: PrismaService);
    handleBookingCreated(event: BookingCreatedEvent): Promise<void>;
    handleBookingEnded(event: QueueCompactedEvent): Promise<void>;
}
