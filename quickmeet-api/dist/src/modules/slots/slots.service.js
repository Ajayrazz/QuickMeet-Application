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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const domain_exceptions_1 = require("../../common/exceptions/domain.exceptions");
const client_1 = require("@prisma/client");
let SlotsService = class SlotsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(adminId, dto) {
        const aptType = await this.prisma.appointmentType.findUnique({
            where: { id: dto.appointmentTypeId },
        });
        if (!aptType)
            throw new common_1.NotFoundException('Appointment type not found');
        if (aptType.adminId !== adminId)
            throw new domain_exceptions_1.ForbiddenResourceException();
        const startTime = new Date(dto.startTime);
        const endTime = new Date(dto.endTime);
        const now = new Date();
        if (startTime < now) {
            throw new common_1.BadRequestException('Start time must be in the future');
        }
        if (startTime >= endTime) {
            throw new common_1.BadRequestException('Start time must be before end time');
        }
        return this.prisma.slot.create({
            data: {
                appointmentTypeId: dto.appointmentTypeId,
                startTime,
                endTime,
                capacity: dto.capacity,
            },
        });
    }
    async update(adminId, id, dto) {
        const slot = await this.prisma.slot.findUnique({
            where: { id },
            include: { appointmentType: true },
        });
        if (!slot)
            throw new common_1.NotFoundException('Slot not found');
        if (slot.appointmentType.adminId !== adminId)
            throw new domain_exceptions_1.ForbiddenResourceException();
        return this.prisma.slot.update({
            where: { id },
            data: dto,
        });
    }
    async findByAppointmentTypeAndDate(appointmentTypeId, date) {
        const startDate = new Date(`${date}T00:00:00.000Z`);
        const endDate = new Date(`${date}T23:59:59.999Z`);
        const slots = await this.prisma.slot.findMany({
            where: {
                appointmentTypeId,
                startTime: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                bookings: {
                    where: {
                        status: { in: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.IN_QUEUE] },
                    },
                    select: { id: true },
                },
            },
            orderBy: { startTime: 'asc' },
        });
        return slots.map((slot) => {
            const activeBookingsCount = slot.bookings.length;
            const { bookings, ...slotDetails } = slot;
            return {
                ...slotDetails,
                availableCapacity: slot.capacity - activeBookingsCount,
            };
        });
    }
};
exports.SlotsService = SlotsService;
exports.SlotsService = SlotsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SlotsService);
//# sourceMappingURL=slots.service.js.map