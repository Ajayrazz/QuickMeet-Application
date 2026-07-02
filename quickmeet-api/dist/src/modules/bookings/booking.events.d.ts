export declare const BookingEvents: {
    CREATED: string;
    CANCELLED: string;
    SERVED: string;
    NO_SHOW: string;
};
export declare class BookingCreatedEvent {
    readonly bookingId: string;
    readonly slotId: string;
    readonly userId: string;
    readonly queuePosition: number;
    constructor(bookingId: string, slotId: string, userId: string, queuePosition: number);
}
export declare class QueueCompactedEvent {
    readonly slotId: string;
    readonly removedBookingId: string;
    readonly removedPosition: number;
    readonly affectedBookings: {
        bookingId: string;
        newPosition: number;
    }[];
    constructor(slotId: string, removedBookingId: string, removedPosition: number, affectedBookings: {
        bookingId: string;
        newPosition: number;
    }[]);
}
