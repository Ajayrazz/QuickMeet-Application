import { PrismaService } from '../../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    private provider;
    private readonly logger;
    constructor(prisma: PrismaService, provider: any);
    sendNotification(userId: string, type: string, title: string, body: string, relatedBookingId?: string): Promise<void>;
    getMyNotifications(userId: string, page?: number, limit?: number): Promise<{
        data: {
            type: string;
            id: string;
            createdAt: Date;
            userId: string;
            title: string;
            body: string;
            isRead: boolean;
            relatedBookingId: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    markAsRead(userId: string, id: string): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        body: string;
        isRead: boolean;
        relatedBookingId: string | null;
    } | null>;
}
