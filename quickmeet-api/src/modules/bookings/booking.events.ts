export const BookingEvents = {
  CREATED: 'booking.created',
  CANCELLED: 'booking.cancelled',
  SERVED: 'booking.served',
  NO_SHOW: 'booking.no-show',
};

export class BookingCreatedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly slotId: string,
    public readonly userId: string,
    public readonly queuePosition: number,
  ) {}
}

export class QueueCompactedEvent {
  constructor(
    public readonly slotId: string,
    public readonly removedBookingId: string,
    public readonly removedPosition: number,
    public readonly affectedBookings: {
      bookingId: string;
      newPosition: number;
    }[],
  ) {}
}
