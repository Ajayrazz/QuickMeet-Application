"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueCompactedEvent = exports.BookingCreatedEvent = exports.BookingEvents = void 0;
exports.BookingEvents = {
    CREATED: 'booking.created',
    CANCELLED: 'booking.cancelled',
    SERVED: 'booking.served',
    NO_SHOW: 'booking.no-show',
};
class BookingCreatedEvent {
    bookingId;
    slotId;
    userId;
    queuePosition;
    constructor(bookingId, slotId, userId, queuePosition) {
        this.bookingId = bookingId;
        this.slotId = slotId;
        this.userId = userId;
        this.queuePosition = queuePosition;
    }
}
exports.BookingCreatedEvent = BookingCreatedEvent;
class QueueCompactedEvent {
    slotId;
    removedBookingId;
    removedPosition;
    affectedBookings;
    constructor(slotId, removedBookingId, removedPosition, affectedBookings) {
        this.slotId = slotId;
        this.removedBookingId = removedBookingId;
        this.removedPosition = removedPosition;
        this.affectedBookings = affectedBookings;
    }
}
exports.QueueCompactedEvent = QueueCompactedEvent;
//# sourceMappingURL=booking.events.js.map