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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var JobsEventsListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsEventsListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const booking_events_1 = require("../modules/bookings/booking.events");
let JobsEventsListener = JobsEventsListener_1 = class JobsEventsListener {
    remindersQueue;
    prisma;
    logger = new common_1.Logger(JobsEventsListener_1.name);
    constructor(remindersQueue, prisma) {
        this.remindersQueue = remindersQueue;
        this.prisma = prisma;
    }
    async handleBookingCreated(event) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: event.bookingId },
            include: { slot: true },
        });
        if (!booking)
            return;
        const slotTime = booking.slot.startTime.getTime();
        const reminderTime = slotTime - 30 * 60 * 1000;
        const delay = reminderTime - Date.now();
        if (delay > 0) {
            const job = await this.remindersQueue.add('reminder', {
                bookingId: event.bookingId,
                slotId: event.slotId,
                userId: event.userId,
            }, { delay });
            await this.prisma.booking.update({
                where: { id: event.bookingId },
                data: { reminderJobId: job.id },
            });
            this.logger.log(`Scheduled reminder job ${job.id} for booking ${event.bookingId} in ${delay}ms`);
        }
    }
    async handleBookingEnded(event) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: event.removedBookingId },
            select: { reminderJobId: true },
        });
        if (booking && booking.reminderJobId) {
            await this.remindersQueue.remove(booking.reminderJobId);
            this.logger.log(`Removed reminder job ${booking.reminderJobId} for booking ${event.removedBookingId}`);
        }
    }
};
exports.JobsEventsListener = JobsEventsListener;
__decorate([
    (0, event_emitter_1.OnEvent)(booking_events_1.BookingEvents.CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [booking_events_1.BookingCreatedEvent]),
    __metadata("design:returntype", Promise)
], JobsEventsListener.prototype, "handleBookingCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(booking_events_1.BookingEvents.CANCELLED),
    (0, event_emitter_1.OnEvent)(booking_events_1.BookingEvents.SERVED),
    (0, event_emitter_1.OnEvent)(booking_events_1.BookingEvents.NO_SHOW),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [booking_events_1.QueueCompactedEvent]),
    __metadata("design:returntype", Promise)
], JobsEventsListener.prototype, "handleBookingEnded", null);
exports.JobsEventsListener = JobsEventsListener = JobsEventsListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('reminders')),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        prisma_service_1.PrismaService])
], JobsEventsListener);
//# sourceMappingURL=jobs-events.listener.js.map