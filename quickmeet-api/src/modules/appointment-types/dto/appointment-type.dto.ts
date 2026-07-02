import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';

export class CreateAppointmentTypeDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  avgServiceDurationMinutes?: number;
}

export class UpdateAppointmentTypeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  avgServiceDurationMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
