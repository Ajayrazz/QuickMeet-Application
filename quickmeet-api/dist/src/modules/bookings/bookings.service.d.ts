import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateBookingDto } from './dto/booking.dto';
import { BookingStatus } from '@prisma/client';
export declare class BookingsService {
    private prisma;
    private eventEmitter;
    private jwtService;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2, jwtService: JwtService, configService: ConfigService);
    create(userId: string, dto: CreateBookingDto): Promise<any>;
    cancel(userId: string, bookingId: string, isAdmin: boolean): Promise<{
        message: string;
    }>;
    serve(userId: string, bookingId: string): Promise<{
        message: string;
    }>;
    noShow(userId: string, bookingId: string): Promise<{
        message: string;
    }>;
    private compactQueue;
    findMyBookings(userId: string, status?: BookingStatus, page?: number, limit?: number): Promise<{
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
                appointmentTypeId: string;
                startTime: Date;
                endTime: Date;
                capacity: number;
                status: import("@prisma/client").$Enums.SlotStatus;
            };
        } & {
            id: string;
            userId: string;
            status: import("@prisma/client").$Enums.BookingStatus;
            slotId: string;
            queuePosition: number | null;
            qrCode: string | null;
            bookedAt: Date;
            servedAt: Date | null;
            cancelledAt: Date | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(userId: string, id: string, isAdmin: boolean): Promise<{
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
            appointmentTypeId: string;
            startTime: Date;
            endTime: Date;
            capacity: number;
            status: import("@prisma/client").$Enums.SlotStatus;
        };
    } & {
        id: string;
        userId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        slotId: string;
        queuePosition: number | null;
        qrCode: string | null;
        bookedAt: Date;
        servedAt: Date | null;
        cancelledAt: Date | null;
    }>;
    getQueueSnapshot(slotId: string): Promise<{
        bookingId: any;
        userId: any;
        position: any;
        etaMinutes: number;
    }[]>;
}
