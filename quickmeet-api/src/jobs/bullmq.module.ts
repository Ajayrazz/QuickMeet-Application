import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { ReminderProcessor } from './processors/reminder.processor';
import { JobsEventsListener } from './jobs-events.listener';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'reminders',
    }),
  ],
  providers: [ReminderProcessor, JobsEventsListener],
  exports: [BullModule], // Export BullModule in case other modules need to inject queues
})
export class JobsModule {}
