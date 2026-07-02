import { SlotsService } from './slots.service';
import { CreateSlotDto, UpdateSlotDto } from './dto/slot.dto';
export declare class SlotsController {
    private readonly slotsService;
    constructor(slotsService: SlotsService);
    create(user: any, dto: CreateSlotDto): Promise<{
        id: string;
        createdAt: Date;
        appointmentTypeId: string;
        startTime: Date;
        endTime: Date;
        capacity: number;
        status: import("@prisma/client").$Enums.SlotStatus;
    }>;
    update(user: any, id: string, dto: UpdateSlotDto): Promise<{
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
