import { Injectable, Logger } from '@nestjs/common';
import { NotificationProvider } from '../notification-provider.interface';

@Injectable()
export class ConsoleNotificationProvider implements NotificationProvider {
  private readonly logger = new Logger(ConsoleNotificationProvider.name);

  async sendPush(pushToken: string, title: string, body: string, data?: Record<string, any>): Promise<void> {
    this.logger.log(`[PUSH SIMULATION to ${pushToken}] Title: "${title}", Body: "${body}", Data: ${JSON.stringify(data)}`);
  }
}
