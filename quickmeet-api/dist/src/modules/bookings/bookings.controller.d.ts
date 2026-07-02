import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/booking.dto';
import { QueueService } from '../queue/queue.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { BookingStatus } from '@prisma/client';
export declare class BookingsController {
    private readonly bookingsService;
    private readonly queueService;
    constructor(bookingsService: BookingsService, queueService: QueueService);
    create(user: any, dto: CreateBookingDto): Promise<any>;
    cancel(user: any, id: string): Promise<{
        message: string;
    }>;
    serve(user: any, id: string): Promise<{
        message: string;
    }>;
    noShow(user: any, id: string): Promise<{
        message: string;
    }>;
    findMyBookings(user: any, status?: BookingStatus, pagination?: PaginationQueryDto): Promise<{
        data: ({
            slot: {
                appointmentType: {
                    id: string;
                    createdAt: Date;
                    title: string;
                    description: string | null;
                    category: string | null;
                    location: string | null;
                    avgServiceDurationMinutes: number;
                    isActive: boolean;
                    adminId: string;
                };
            } & {
                id: string;
                createdAt: Date;
                startTime: Date;
                endTime: Date;
                capacity: number;
                status: import("@prisma/client").$Enums.SlotStatus;
                appointmentTypeId: string;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.BookingStatus;
            queuePosition: number | null;
            qrCode: string | null;
            bookedAt: Date;
            servedAt: Date | null;
            cancelledAt: Date | null;
            reminderJobId: string | null;
            userId: string;
            slotId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: any, id: string): Promise<{
        slot: {
            appointmentType: {
                id: string;
                createdAt: Date;
                title: string;
                description: string | null;
                category: string | null;
                location: string | null;
                avgServiceDurationMinutes: number;
                isActive: boolean;
                adminId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            startTime: Date;
            endTime: Date;
            capacity: number;
            status: import("@prisma/client").$Enums.SlotStatus;
            appointmentTypeId: string;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        queuePosition: number | null;
        qrCode: string | null;
        bookedAt: Date;
        servedAt: Date | null;
        cancelledAt: Date | null;
        reminderJobId: string | null;
        userId: string;
        slotId: string;
    }>;
    getQueueSnapshot(slotId: string): Promise<import("../queue/queue.service").QueueSnapshotItem[]>;
}
