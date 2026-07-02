import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { RedisService } from './redis/redis.service';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AppointmentTypesModule } from './modules/appointment-types/appointment-types.module';
import { SlotsModule } from './modules/slots/slots.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './modules/users/users.module';
import { QueueModule } from './modules/queue/queue.module';
import { JobsModule } from './jobs/bullmq.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from 'nestjs-pino';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnv,
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'body.password',
            'body.token',
            'body.refreshToken',
            'body.pushToken',
          ],
          censor: '[REDACTED]',
        },
      },
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,
    NotificationsModule,
    AuthModule,
    AppointmentTypesModule,
    SlotsModule,
    BookingsModule,
    RedisModule,
    UsersModule,
    QueueModule,
    JobsModule,
    AnalyticsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
