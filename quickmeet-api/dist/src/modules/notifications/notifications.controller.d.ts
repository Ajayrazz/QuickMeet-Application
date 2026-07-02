import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getMyNotifications(user: any, page?: string, limit?: string): Promise<{
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
    markAsRead(user: any, id: string): Promise<{
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
