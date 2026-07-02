import { apiClient as api } from './client';
import { Slot } from './slots.api';

export interface CreateSlotDto {
  appointmentTypeId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  capacity: number;
}

export interface UpdateSlotDto {
  status?: 'OPEN' | 'CLOSED';
  capacity?: number;
}

export const createSlot = async (dto: CreateSlotDto): Promise<Slot> => {
  const { data } = await api.post<Slot>('/slots', dto);
  return data;
};

export const updateSlot = async (id: string, dto: UpdateSlotDto): Promise<Slot> => {
  const { data } = await api.patch<Slot>(`/slots/${id}`, dto);
  return data;
};
