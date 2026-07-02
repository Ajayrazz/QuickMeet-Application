import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
export interface QueueSnapshotItem {
    bookingId: string;
    userId: string;
    position: number | null;
    etaMinutes: number;
}
export declare class QueueService {
    private prisma;
    private redisService;
    private readonly logger;
    constructor(prisma: PrismaService, redisService: RedisService);
    getSnapshot(slotId: string): Promise<QueueSnapshotItem[]>;
    rebuildAndCacheSnapshot(slotId: string): Promise<QueueSnapshotItem[]>;
}
