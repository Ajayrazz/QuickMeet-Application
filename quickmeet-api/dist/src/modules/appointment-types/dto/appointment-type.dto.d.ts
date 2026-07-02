export declare class CreateAppointmentTypeDto {
    title: string;
    description?: string;
    category?: string;
    location?: string;
    avgServiceDurationMinutes?: number;
}
export declare class UpdateAppointmentTypeDto {
    title?: string;
    description?: string;
    category?: string;
    location?: string;
    avgServiceDurationMinutes?: number;
    isActive?: boolean;
}
