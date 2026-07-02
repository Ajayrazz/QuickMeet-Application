import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { ExpoPushProvider } from './providers/expo-push.provider';
import { ConsoleNotificationProvider } from './providers/console.provider';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [
    {
      provide: 'NOTIFICATION_PROVIDER',
      useFactory: (configService: ConfigService) => {
        const provider = configService.get('NOTIFICATION_PROVIDER');
        return provider === 'expo' ? new ExpoPushProvider() : new ConsoleNotificationProvider();
      },
      inject: [ConfigService],
    },
    NotificationsService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
