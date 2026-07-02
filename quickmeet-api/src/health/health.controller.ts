import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async check() {
    try {
      // Check Postgres
      await this.prisma.$queryRaw`SELECT 1`;

      // Check Redis
      const redisClient = this.redisService.getClient();
      const pingResult = await redisClient.ping();

      if (pingResult !== 'PONG') {
        throw new Error('Redis ping failed');
      }

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Service Unavailable',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
