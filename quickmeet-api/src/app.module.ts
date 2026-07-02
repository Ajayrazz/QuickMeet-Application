import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
        redact: ['req.headers.authorization', 'req.body.password', 'req.body.token', 'req.body.refreshToken'],
      },
    }),
    EventEmitterModule.forRoot(),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
