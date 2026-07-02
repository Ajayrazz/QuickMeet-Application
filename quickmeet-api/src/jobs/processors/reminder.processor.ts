import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('reminders')
export class ReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(ReminderProcessor.name);

  constructor(
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { bookingId, userId } = job.data;

    this.logger.log(
      `Processing reminder job ${job.id} for booking ${bookingId}`,
    );

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { slot: { include: { appointmentType: true } } },
    });

    if (
      !booking ||
      (booking.status !== 'CONFIRMED' && booking.status !== 'IN_QUEUE')
    ) {
      this.logger.warn(
        `Skipping reminder for booking ${bookingId}: status changed or not found`,
      );
      return;
    }

    const title = 'Upcoming Appointment';
    const body = `Your appointment for ${booking.slot.appointmentType.title} is coming up soon!`;

    await this.notificationsService.sendNotification(
      userId,
      'REMINDER',
      title,
      body,
      bookingId,
    );

    return { success: true };
  }
}
