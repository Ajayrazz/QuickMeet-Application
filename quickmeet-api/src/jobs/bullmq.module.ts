import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { ReminderProcessor } from './processors/reminder.processor';
import { JobsEventsListener } from './jobs-events.listener';
import { createRedisClient } from '../config/redis.config';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        return {
          connection: createRedisClient(redisUrl, 'BullMQ-Connection') as any,
        };
      },
    }),
    BullModule.registerQueue({
      name: 'reminders',
    }),
  ],
  providers: [ReminderProcessor, JobsEventsListener],
  exports: [BullModule], // Export BullModule in case other modules need to inject queues
})
export class JobsModule {}
