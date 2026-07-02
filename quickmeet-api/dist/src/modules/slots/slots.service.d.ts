import { PrismaService } from '../../prisma/prisma.service';
import { CreateSlotDto, UpdateSlotDto } from './dto/slot.dto';
export declare class SlotsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(adminId: string, dto: CreateSlotDto): Promise<{
        id: string;
        createdAt: Date;
        startTime: Date;
        endTime: Date;
        capacity: number;
        status: import("@prisma/client").$Enums.SlotStatus;
        appointmentTypeId: string;
    }>;
    update(adminId: string, id: string, dto: UpdateSlotDto): Promise<{
        id: string;
        createdAt: Date;
        startTime: Date;
        endTime: Date;
        capacity: number;
        status: import("@prisma/client").$Enums.SlotStatus;
        appointmentTypeId: string;
    }>;
    findByAppointmentTypeAndDate(appointmentTypeId: string, date: string): Promise<any[]>;
}
