import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
export declare class AnalyticsService {
    private prisma;
    private redisService;
    private readonly logger;
    constructor(prisma: PrismaService, redisService: RedisService);
    getOverview(appointmentTypeId?: string, from?: string, to?: string): Promise<{}>;
}
