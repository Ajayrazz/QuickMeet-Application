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
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../redis/redis.service");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    prisma;
    redisService;
    logger = new common_1.Logger(AnalyticsService_1.name);
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
    }
    async getOverview(appointmentTypeId, from, to) {
        const cacheKey = `analytics:overview:${appointmentTypeId || 'all'}:${from || 'all'}:${to || 'all'}`;
        const cached = await this.redisService.getJSON(cacheKey);
        if (cached) {
            return cached;
        }
        const whereClause = {};
        if (appointmentTypeId) {
            whereClause.slot = { appointmentType: { id: appointmentTypeId } };
        }
        if (from || to) {
            whereClause.bookedAt = {};
            if (from)
                whereClause.bookedAt.gte = new Date(from);
            if (to)
                whereClause.bookedAt.lte = new Date(to);
        }
        const totalBookings = await this.prisma.booking.count({
            where: whereClause,
        });
        const breakdownRaw = await this.prisma.booking.groupBy({
            by: ['status'],
            where: whereClause,
            _count: true,
        });
        const breakdown = breakdownRaw.reduce((acc, curr) => {
            acc[curr.status] = curr._count;
            return acc;
        }, {});
        const avgWaitTimeRaw = await this.prisma.$queryRaw `
      SELECT AVG(EXTRACT(EPOCH FROM ("servedAt" - "bookedAt")) / 60) as "avgWaitMinutes"
      FROM "Booking" b
      LEFT JOIN "Slot" s ON b."slotId" = s.id
      WHERE b.status = 'SERVED'
      ${appointmentTypeId ? this.prisma.$queryRaw `AND s."appointmentTypeId" = ${appointmentTypeId}` : this.prisma.$queryRaw ``}
      ${from ? this.prisma.$queryRaw `AND b."bookedAt" >= ${new Date(from)}` : this.prisma.$queryRaw ``}
      ${to ? this.prisma.$queryRaw `AND b."bookedAt" <= ${new Date(to)}` : this.prisma.$queryRaw ``}
    `;
        const avgWaitMinutes = avgWaitTimeRaw[0]?.avgWaitMinutes || 0;
        const bookingsPerDayRaw = await this.prisma.$queryRaw `
      SELECT DATE_TRUNC('day', b."bookedAt") as date, COUNT(*) as count
      FROM "Booking" b
      LEFT JOIN "Slot" s ON b."slotId" = s.id
      WHERE 1=1
      ${appointmentTypeId ? this.prisma.$queryRaw `AND s."appointmentTypeId" = ${appointmentTypeId}` : this.prisma.$queryRaw ``}
      ${from ? this.prisma.$queryRaw `AND b."bookedAt" >= ${new Date(from)}` : this.prisma.$queryRaw ``}
      ${to ? this.prisma.$queryRaw `AND b."bookedAt" <= ${new Date(to)}` : this.prisma.$queryRaw ``}
      GROUP BY DATE_TRUNC('day', b."bookedAt")
      ORDER BY date ASC
    `;
        const bookingsPerDay = bookingsPerDayRaw.map((row) => ({
            date: row.date,
            count: Number(row.count),
        }));
        const result = {
            totalBookings,
            breakdown,
            avgWaitMinutes: Number(avgWaitMinutes),
            bookingsPerDay,
        };
        await this.redisService.setJSON(cacheKey, result, 60);
        return result;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map