"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QueueEventsListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueEventsListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const queue_service_1 = require("./queue.service");
const queue_gateway_1 = require("./queue.gateway");
const booking_events_1 = require("../bookings/booking.events");
const notifications_service_1 = require("../notifications/notifications.service");
let QueueEventsListener = QueueEventsListener_1 = class QueueEventsListener {
    queueService;
    queueGateway;
    notificationsService;
    logger = new common_1.Logger(QueueEventsListener_1.name);
    constructor(queueService, queueGateway, notificationsService) {
        this.queueService = queueService;
        this.queueGateway = queueGateway;
        this.notificationsService = notificationsService;
    }
    async handleBookingCreated(event) {
        this.logger.log(`Processing BookingCreatedEvent for slot ${event.slotId}`);
        const snapshot = await this.queueService.rebuildAndCacheSnapshot(event.slotId);
        this.queueGateway.server.to(`slot:${event.slotId}`).emit('queue:update', snapshot);
        await this.notificationsService.sendNotification(event.userId, 'BOOKING_CREATED', 'Booking Confirmed!', `You are now in the queue at position ${event.queuePosition}.`, event.bookingId);
    }
    async handleQueueCompacted(event) {
        this.logger.log(`Processing compaction for slot ${event.slotId} (removed pos ${event.removedPosition})`);
        const snapshot = await this.queueService.rebuildAndCacheSnapshot(event.slotId);
        this.queueGateway.server.to(`slot:${event.slotId}`).emit('queue:update', snapshot);
        for (const b of event.affectedBookings) {
            if (b.newPosition === 1) {
                const userSnapshot = snapshot.find(s => s.bookingId === b.bookingId);
                if (userSnapshot) {
                    const personalRoom = `user:${userSnapshot.userId}`;
                    this.queueGateway.server.to(personalRoom).emit('queue:your-turn', {
                        bookingId: b.bookingId,
                        slotId: event.slotId,
                    });
                    await this.notificationsService.sendNotification(userSnapshot.userId, 'YOUR_TURN', 'It is your turn!', 'Please head to the service desk now.', b.bookingId);
                }
            }
            else if (b.newPosition <= 3) {
                const userSnapshot = snapshot.find(s => s.bookingId === b.bookingId);
                if (userSnapshot) {
                    await this.notificationsService.sendNotification(userSnapshot.userId, 'QUEUE_NEAR', 'You are almost up!', `You are now at position ${b.newPosition} in the queue.`, b.bookingId);
                }
            }
        }
    }
};
exports.QueueEventsListener = QueueEventsListener;
__decorate([
    (0, event_emitter_1.OnEvent)(booking_events_1.BookingEvents.CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [booking_events_1.BookingCreatedEvent]),
    __metadata("design:returntype", Promise)
], QueueEventsListener.prototype, "handleBookingCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(booking_events_1.BookingEvents.CANCELLED),
    (0, event_emitter_1.OnEvent)(booking_events_1.BookingEvents.SERVED),
    (0, event_emitter_1.OnEvent)(booking_events_1.BookingEvents.NO_SHOW),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [booking_events_1.QueueCompactedEvent]),
    __metadata("design:returntype", Promise)
], QueueEventsListener.prototype, "handleQueueCompacted", null);
exports.QueueEventsListener = QueueEventsListener = QueueEventsListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        queue_gateway_1.QueueGateway,
        notifications_service_1.NotificationsService])
], QueueEventsListener);
//# sourceMappingURL=queue-events.listener.js.map