import { IsString, IsDateString, IsInt, Min, IsEnum, IsOptional } from 'class-validator';
import { SlotStatus } from '@prisma/client';

export class CreateSlotDto {
  @IsString()
  appointmentTypeId!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsInt()
  @Min(1)
  capacity!: number;
}

export class UpdateSlotDto {
  @IsOptional()
  @IsEnum(SlotStatus)
  status?: SlotStatus;
}
