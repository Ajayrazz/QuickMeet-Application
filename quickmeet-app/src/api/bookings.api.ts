import { apiClient } from './client';

export interface Booking {
  id: string;
  slotId: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_QUEUE' | 'CANCELLED' | 'NO_SHOW' | 'SERVED';
  queuePosition: number | null;
  qrCode: string;
  slot?: {
    startTime: string;
    endTime: string;
    appointmentType?: {
      title: string;
      location: string;
    }
  }
}

export interface QueueSnapshot {
  bookingId: string;
  userId: string;
  position: number | null;
  etaMinutes: number;
}

export const createBooking = async (slotId: string): Promise<Booking> => {
  const response = await apiClient.post('/bookings', { slotId });
  return response.data;
};

export const cancelBooking = async (id: string): Promise<Booking> => {
  const response = await apiClient.patch(`/bookings/${id}/cancel`);
  return response.data;
};

export const fetchMyBookings = async (status?: string): Promise<Booking[]> => {
  const params = status ? { status } : {};
  const response = await apiClient.get('/bookings/me', { params });
  return response.data.data || response.data; // Fallback just in case it's not paginated
};

export const fetchBooking = async (id: string): Promise<Booking> => {
  const response = await apiClient.get(`/bookings/${id}`);
  return response.data;
};

export const fetchQueueSnapshot = async (slotId: string): Promise<QueueSnapshot[]> => {
  const response = await apiClient.get(`/queue/${slotId}`);
  return response.data;
};
