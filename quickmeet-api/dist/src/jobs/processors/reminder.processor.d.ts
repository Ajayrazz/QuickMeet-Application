import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
export declare class ReminderProcessor extends WorkerHost {
    private notificationsService;
    private prisma;
    private readonly logger;
    constructor(notificationsService: NotificationsService, prisma: PrismaService);
    process(job: Job<any, any, string>): Promise<any>;
}
