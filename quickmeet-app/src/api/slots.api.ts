import { apiClient } from './client';

export interface Slot {
  id: string;
  appointmentTypeId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  remainingCapacity: number;
  status: 'OPEN' | 'FULL' | 'CANCELLED';
}

export const fetchSlots = async (appointmentTypeId: string, dateStr: string): Promise<Slot[]> => {
  const response = await apiClient.get('/slots', {
    params: {
      appointmentTypeId,
      date: dateStr, // Expected format: YYYY-MM-DD from date-fns
    },
  });
  return response.data;
};
