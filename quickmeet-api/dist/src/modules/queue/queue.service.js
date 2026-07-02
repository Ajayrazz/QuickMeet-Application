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
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../redis/redis.service");
const eta_util_1 = require("../../common/utils/eta.util");
const client_1 = require("@prisma/client");
let QueueService = QueueService_1 = class QueueService {
    prisma;
    redisService;
    logger = new common_1.Logger(QueueService_1.name);
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
    }
    async getSnapshot(slotId) {
        const cacheKey = `queue:${slotId}`;
        const cached = await this.redisService.getJSON(cacheKey);
        if (cached) {
            return cached;
        }
        this.logger.log(`Cache miss for queue snapshot: ${slotId}`);
        return this.rebuildAndCacheSnapshot(slotId);
    }
    async rebuildAndCacheSnapshot(slotId) {
        const slot = await this.prisma.slot.findUnique({
            where: { id: slotId },
            include: { appointmentType: true },
        });
        if (!slot) {
            return [];
        }
        const bookings = await this.prisma.booking.findMany({
            where: {
                slotId,
                status: { in: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.IN_QUEUE] },
            },
            select: { id: true, userId: true, queuePosition: true },
            orderBy: { queuePosition: 'asc' },
        });
        const avgDuration = slot.appointmentType.avgServiceDurationMinutes;
        const snapshot = bookings.map((b) => ({
            bookingId: b.id,
            userId: b.userId,
            position: b.queuePosition,
            etaMinutes: b.queuePosition ? (0, eta_util_1.calculateETA)(b.queuePosition, avgDuration) : 0,
        }));
        const cacheKey = `queue:${slotId}`;
        await this.redisService.setJSON(cacheKey, snapshot, 300);
        return snapshot;
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], QueueService);
//# sourceMappingURL=queue.service.js.map