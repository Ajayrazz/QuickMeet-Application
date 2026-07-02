import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { calculateETA } from '../../common/utils/eta.util';
import { BookingStatus } from '@prisma/client';

export interface QueueSnapshotItem {
  bookingId: string;
  userId: string;
  position: number | null;
  etaMinutes: number;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /**
   * Fetches the snapshot from Redis first. If not found, builds it from DB,
   * saves it to Redis, and returns it.
   */
  async getSnapshot(slotId: string): Promise<QueueSnapshotItem[]> {
    const cacheKey = `queue:${slotId}`;
    
    const cached = await this.redisService.getJSON<QueueSnapshotItem[]>(cacheKey);
    if (cached) {
      return cached;
    }

    this.logger.log(`Cache miss for queue snapshot: ${slotId}`);
    return this.rebuildAndCacheSnapshot(slotId);
  }

  /**
   * Rebuilds the snapshot from the source of truth (Postgres) and caches it.
   */
  async rebuildAndCacheSnapshot(slotId: string): Promise<QueueSnapshotItem[]> {
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
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_QUEUE] },
      },
      select: { id: true, userId: true, queuePosition: true },
      orderBy: { queuePosition: 'asc' },
    });

    const avgDuration = slot.appointmentType.avgServiceDurationMinutes;

    const snapshot: QueueSnapshotItem[] = bookings.map((b) => ({
      bookingId: b.id,
      userId: b.userId,
      position: b.queuePosition,
      etaMinutes: b.queuePosition ? calculateETA(b.queuePosition, avgDuration) : 0,
    }));

    // Cache with a short TTL (e.g., 5 minutes)
    const cacheKey = `queue:${slotId}`;
    await this.redisService.setJSON(cacheKey, snapshot, 300);

    return snapshot;
  }
}
