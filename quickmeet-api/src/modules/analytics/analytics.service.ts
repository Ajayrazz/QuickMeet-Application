import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async getOverview(appointmentTypeId?: string, from?: string, to?: string) {
    const cacheKey = `analytics:overview:${appointmentTypeId || 'all'}:${from || 'all'}:${to || 'all'}`;
    const cached = await this.redisService.getJSON(cacheKey);
    if (cached) {
      return cached;
    }

    const whereClause: any = {};
    if (appointmentTypeId) {
      whereClause.slot = { appointmentType: { id: appointmentTypeId } };
    }

    if (from || to) {
      whereClause.bookedAt = {};
      if (from) whereClause.bookedAt.gte = new Date(from);
      if (to) whereClause.bookedAt.lte = new Date(to);
    }

    // 1. Total Bookings
    const totalBookings = await this.prisma.booking.count({
      where: whereClause,
    });

    // 2. Breakdown (Completed vs No-Show vs Cancelled)
    const breakdownRaw = await this.prisma.booking.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
    });

    const breakdown = breakdownRaw.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      },
      {} as Record<string, number>,
    );

    // 3. Average Wait Time (ServedAt - BookedAt)
    // Using raw SQL for precise time difference aggregation
    const avgWaitTimeRaw = await this.prisma.$queryRaw<any[]>`
      SELECT AVG(EXTRACT(EPOCH FROM ("servedAt" - "bookedAt")) / 60) as "avgWaitMinutes"
      FROM "Booking" b
      LEFT JOIN "Slot" s ON b."slotId" = s.id
      WHERE b.status = 'SERVED'
      ${appointmentTypeId ? this.prisma.$queryRaw`AND s."appointmentTypeId" = ${appointmentTypeId}` : this.prisma.$queryRaw``}
      ${from ? this.prisma.$queryRaw`AND b."bookedAt" >= ${new Date(from)}` : this.prisma.$queryRaw``}
      ${to ? this.prisma.$queryRaw`AND b."bookedAt" <= ${new Date(to)}` : this.prisma.$queryRaw``}
    `;

    const avgWaitMinutes = avgWaitTimeRaw[0]?.avgWaitMinutes || 0;

    // 4. Bookings per day (for a simple chart)
    const bookingsPerDayRaw = await this.prisma.$queryRaw<any[]>`
      SELECT DATE_TRUNC('day', b."bookedAt") as date, COUNT(*) as count
      FROM "Booking" b
      LEFT JOIN "Slot" s ON b."slotId" = s.id
      WHERE 1=1
      ${appointmentTypeId ? this.prisma.$queryRaw`AND s."appointmentTypeId" = ${appointmentTypeId}` : this.prisma.$queryRaw``}
      ${from ? this.prisma.$queryRaw`AND b."bookedAt" >= ${new Date(from)}` : this.prisma.$queryRaw``}
      ${to ? this.prisma.$queryRaw`AND b."bookedAt" <= ${new Date(to)}` : this.prisma.$queryRaw``}
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

    // Cache the result for 60 seconds
    await this.redisService.setJSON(cacheKey, result, 60);

    return result;
  }
}
