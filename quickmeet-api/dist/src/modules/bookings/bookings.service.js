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
var BookingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const booking_events_1 = require("./booking.events");
const domain_exceptions_1 = require("../../common/exceptions/domain.exceptions");
const queue_util_1 = require("../../common/utils/queue.util");
const eta_util_1 = require("../../common/utils/eta.util");
const client_1 = require("@prisma/client");
let BookingsService = BookingsService_1 = class BookingsService {
    prisma;
    eventEmitter;
    jwtService;
    configService;
    logger = new common_1.Logger(BookingsService_1.name);
    constructor(prisma, eventEmitter, jwtService, configService) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async create(userId, dto) {
        const booking = await this.prisma.$transaction(async (tx) => {
            const slots = await tx.$queryRaw `
        SELECT id, capacity, status, "appointmentTypeId" 
        FROM "Slot" 
        WHERE id = ${dto.slotId} 
        FOR UPDATE
      `;
            if (slots.length === 0) {
                throw new common_1.NotFoundException('Slot not found');
            }
            const slot = slots[0];
            if (slot.status !== client_1.SlotStatus.OPEN) {
                throw new domain_exceptions_1.SlotNotOpenException();
            }
            const activeBookings = await tx.booking.findMany({
                where: {
                    slotId: slot.id,
                    status: { in: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.IN_QUEUE] },
                },
                select: { id: true, userId: true, queuePosition: true },
            });
            if (activeBookings.length >= slot.capacity) {
                throw new domain_exceptions_1.SlotFullException();
            }
            if (activeBookings.some((b) => b.userId === userId)) {
                throw new domain_exceptions_1.DuplicateBookingException();
            }
            const existingPositions = activeBookings
                .map((b) => b.queuePosition)
                .filter((p) => p !== null);
            const queuePosition = (0, queue_util_1.calculateQueuePosition)(existingPositions);
            const newBooking = await tx.booking.create({
                data: {
                    userId,
                    slotId: slot.id,
                    status: client_1.BookingStatus.CONFIRMED,
                    queuePosition,
                },
            });
            const qrPayload = { bookingId: newBooking.id, slotId: slot.id };
            const qrCode = this.jwtService.sign(qrPayload, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: '24h',
            });
            return tx.booking.update({
                where: { id: newBooking.id },
                data: { qrCode },
            });
        });
        this.eventEmitter.emit(booking_events_1.BookingEvents.CREATED, new booking_events_1.BookingCreatedEvent(booking.id, booking.slotId, booking.userId, booking.queuePosition));
        return booking;
    }
    async cancel(userId, bookingId, isAdmin) {
        return this.compactQueue(userId, bookingId, isAdmin, client_1.BookingStatus.CANCELLED, 'cancelledAt', booking_events_1.BookingEvents.CANCELLED);
    }
    async serve(userId, bookingId) {
        return this.compactQueue(userId, bookingId, true, client_1.BookingStatus.SERVED, 'servedAt', booking_events_1.BookingEvents.SERVED);
    }
    async noShow(userId, bookingId) {
        return this.compactQueue(userId, bookingId, true, client_1.BookingStatus.NO_SHOW, 'cancelledAt', booking_events_1.BookingEvents.NO_SHOW);
    }
    async compactQueue(userId, bookingId, isAdmin, targetStatus, dateField, eventName) {
        const eventPayload = await this.prisma.$transaction(async (tx) => {
            const targetBooking = await tx.booking.findUnique({
                where: { id: bookingId },
                include: { slot: { include: { appointmentType: true } } },
            });
            if (!targetBooking)
                throw new common_1.NotFoundException('Booking not found');
            if (!isAdmin && targetBooking.userId !== userId) {
                throw new domain_exceptions_1.ForbiddenResourceException();
            }
            if (isAdmin && targetBooking.slot.appointmentType.adminId !== userId) {
                throw new domain_exceptions_1.ForbiddenResourceException();
            }
            if (![client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.IN_QUEUE].includes(targetBooking.status)) {
                throw new common_1.BadRequestException('Booking cannot be modified');
            }
            await tx.$queryRaw `SELECT 1 FROM "Slot" WHERE id = ${targetBooking.slotId} FOR UPDATE`;
            const removedPosition = targetBooking.queuePosition;
            const activeBookings = await tx.booking.findMany({
                where: {
                    slotId: targetBooking.slotId,
                    status: { in: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.IN_QUEUE] },
                },
                select: { id: true, queuePosition: true },
            });
            const affectedBookings = (0, queue_util_1.compactQueuePositions)(activeBookings, removedPosition);
            for (const b of affectedBookings) {
                await tx.booking.update({
                    where: { id: b.bookingId },
                    data: { queuePosition: b.newPosition },
                });
            }
            await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: targetStatus,
                    queuePosition: null,
                    [dateField]: new Date(),
                },
            });
            return new booking_events_1.QueueCompactedEvent(targetBooking.slotId, targetBooking.id, removedPosition, affectedBookings);
        });
        this.eventEmitter.emit(eventName, eventPayload);
        return { message: `Booking marked as ${targetStatus}` };
    }
    async findMyBookings(userId, status, page = 1, limit = 10) {
        const where = { userId };
        if (status)
            where.status = status;
        const [data, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { bookedAt: 'desc' },
                include: { slot: { include: { appointmentType: true } } },
            }),
            this.prisma.booking.count({ where }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(userId, id, isAdmin) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: { slot: { include: { appointmentType: true } } },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (!isAdmin && booking.userId !== userId)
            throw new domain_exceptions_1.ForbiddenResourceException();
        if (isAdmin && booking.slot.appointmentType.adminId !== userId)
            throw new domain_exceptions_1.ForbiddenResourceException();
        return booking;
    }
    async getQueueSnapshot(slotId) {
        const slot = await this.prisma.slot.findUnique({
            where: { id: slotId },
            include: { appointmentType: true },
        });
        if (!slot)
            throw new common_1.NotFoundException('Slot not found');
        const bookings = await this.prisma.booking.findMany({
            where: {
                slotId,
                status: { in: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.IN_QUEUE] },
            },
            select: { id: true, userId: true, queuePosition: true },
            orderBy: { queuePosition: 'asc' },
        });
        const avgDuration = slot.appointmentType.avgServiceDurationMinutes;
        return bookings.map((b) => ({
            bookingId: b.id,
            userId: b.userId,
            position: b.queuePosition,
            etaMinutes: (0, eta_util_1.calculateETA)(b.queuePosition, avgDuration),
        }));
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = BookingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2,
        jwt_1.JwtService,
        config_1.ConfigService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map