import { Injectable, Logger } from '@nestjs/common';
import { Expo } from 'expo-server-sdk';
import { NotificationProvider } from '../notification-provider.interface';

@Injectable()
export class ExpoPushProvider implements NotificationProvider {
  private readonly expo = new Expo();
  private readonly logger = new Logger(ExpoPushProvider.name);

  async sendPush(pushToken: string, title: string, body: string, data?: Record<string, any>): Promise<void> {
    if (!Expo.isExpoPushToken(pushToken)) {
      this.logger.warn(`Invalid Expo push token: ${pushToken}`);
      return;
    }

    const messages = [{
      to: pushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
    }];

    try {
      // Best-effort push notification
      const ticketChunks = await this.expo.sendPushNotificationsAsync(messages as any);
      this.logger.log(`Sent Expo push to ${pushToken}: ${JSON.stringify(ticketChunks)}`);
    } catch (error) {
      this.logger.error(`Failed to send Expo push notification to ${pushToken}`, error);
    }
  }
}
