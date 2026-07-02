import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationProvider } from './notification-provider.interface';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('NOTIFICATION_PROVIDER') private provider: any,
  ) {}

  async sendNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    relatedBookingId?: string,
  ) {
    try {
      // 1. Create DB Record
      await this.prisma.notification.create({
        data: {
          userId,
          type,
          title,
          body,
          relatedBookingId,
        },
      });

      // 2. Fetch User to get Push Token
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { pushToken: true },
      });

      // 3. Attempt Push if Token Exists
      if (user && user.pushToken) {
        // Fire-and-forget to avoid blocking the caller
        this.provider.sendPush(user.pushToken, title, body, { type, relatedBookingId }).catch((err: any) => {
          this.logger.error('Failed to send push inside promise catch', err);
        });
      }
    } catch (error) {
      // Catch all to ensure business transactions (like bookings) don't fail due to notification failures
      this.logger.error('Error during sendNotification execution', error);
    }
  }

  async getMyNotifications(userId: string, page: number = 1, limit: number = 20) {
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      return null;
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
