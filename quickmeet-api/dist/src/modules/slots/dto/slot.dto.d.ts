import { SlotStatus } from '@prisma/client';
export declare class CreateSlotDto {
    appointmentTypeId: string;
    startTime: string;
    endTime: string;
    capacity: number;
}
export declare class UpdateSlotDto {
    status?: SlotStatus;
}
