import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.client = new Redis(redisUrl);

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.warn(`Failed to parse JSON from Redis key ${key}`, error);
      return null;
    }
  }

  async setJSON(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const stringified = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, stringified, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, stringified);
      }
    } catch (error) {
      this.logger.warn(`Failed to set JSON to Redis key ${key}`, error);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
