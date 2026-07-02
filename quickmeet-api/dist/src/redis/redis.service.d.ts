import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleDestroy {
    private configService;
    private readonly client;
    private readonly logger;
    constructor(configService: ConfigService);
    getClient(): Redis;
    getJSON<T>(key: string): Promise<T | null>;
    setJSON(key: string, value: any, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
