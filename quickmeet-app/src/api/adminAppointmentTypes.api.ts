import { apiClient as api } from './client';
import { AppointmentType } from './appointmentTypes.api';

export interface CreateAppointmentTypeDto {
  title: string;
  description: string;
  category: string;
  location: string;
  avgServiceDurationMinutes: number;
}

export interface UpdateAppointmentTypeDto extends Partial<CreateAppointmentTypeDto> {
  isActive?: boolean;
}

export const createAppointmentType = async (dto: CreateAppointmentTypeDto): Promise<AppointmentType> => {
  const { data } = await api.post<AppointmentType>('/appointment-types', dto);
  return data;
};

export const updateAppointmentType = async (id: string, dto: UpdateAppointmentTypeDto): Promise<AppointmentType> => {
  const { data } = await api.patch<AppointmentType>(`/appointment-types/${id}`, dto);
  return data;
};
