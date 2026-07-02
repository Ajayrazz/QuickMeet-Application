import { PrismaService } from '../../prisma/prisma.service';
import { CreateSlotDto, UpdateSlotDto } from './dto/slot.dto';
export declare class SlotsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(adminId: string, dto: CreateSlotDto): Promise<{
        id: string;
        createdAt: Date;
        appointmentTypeId: string;
        startTime: Date;
        endTime: Date;
        capacity: number;
        status: import("@prisma/client").$Enums.SlotStatus;
    }>;
    update(adminId: string, id: string, dto: UpdateSlotDto): Promise<{
        id: string;
        createdAt: Date;
        appointmentTypeId: string;
        startTime: Date;
        endTime: Date;
        capacity: number;
        status: import("@prisma/client").$Enums.SlotStatus;
    }>;
    findByAppointmentTypeAndDate(appointmentTypeId: string, date: string): Promise<any[]>;
}
