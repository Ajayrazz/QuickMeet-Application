import { NotificationsService } from './notifications.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getMyNotifications(user: any, pagination?: PaginationQueryDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            title: string;
            userId: string;
            type: string;
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
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        type: string;
        body: string;
        isRead: boolean;
        relatedBookingId: string | null;
    } | null>;
}
