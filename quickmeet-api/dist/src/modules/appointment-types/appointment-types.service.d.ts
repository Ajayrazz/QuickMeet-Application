import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentTypeDto, UpdateAppointmentTypeDto } from './dto/appointment-type.dto';
export declare class AppointmentTypesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(adminId: string, dto: CreateAppointmentTypeDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        category: string | null;
        location: string | null;
        avgServiceDurationMinutes: number;
        isActive: boolean;
        adminId: string;
    }>;
    update(adminId: string, id: string, dto: UpdateAppointmentTypeDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        category: string | null;
        location: string | null;
        avgServiceDurationMinutes: number;
        isActive: boolean;
        adminId: string;
    }>;
    findAll(search?: string, category?: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            title: string;
            description: string | null;
            category: string | null;
            location: string | null;
            avgServiceDurationMinutes: number;
            isActive: boolean;
            adminId: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string | null;
        category: string | null;
        location: string | null;
        avgServiceDurationMinutes: number;
        isActive: boolean;
        adminId: string;
    }>;
}
