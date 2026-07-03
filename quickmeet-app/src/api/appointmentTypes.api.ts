import { apiClient } from './client';

export interface AppointmentType {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  avgServiceDurationMinutes: number;
  isActive: boolean;
}

export const fetchAppointmentTypes = async (search?: string, category?: string): Promise<AppointmentType[]> => {
  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (category) params.category = category;
  
  const response = await apiClient.get('/appointment-types', { params });
  return response.data.data;
};

export const fetchAppointmentType = async (id: string): Promise<AppointmentType> => {
  const response = await apiClient.get(`/appointment-types/${id}`);
  return response.data;
};
