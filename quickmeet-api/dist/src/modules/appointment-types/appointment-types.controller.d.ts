import { AppointmentTypesService } from './appointment-types.service';
import { CreateAppointmentTypeDto, UpdateAppointmentTypeDto } from './dto/appointment-type.dto';
export declare class AppointmentTypesController {
    private readonly appointmentTypesService;
    constructor(appointmentTypesService: AppointmentTypesService);
    create(user: any, dto: CreateAppointmentTypeDto): Promise<{
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
    update(user: any, id: string, dto: UpdateAppointmentTypeDto): Promise<{
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
    findAll(search?: string, category?: string, page?: string, limit?: string): Promise<{
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
