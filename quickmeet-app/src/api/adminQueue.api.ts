import { apiClient as api } from './client';

export const serveBooking = async (id: string): Promise<void> => {
  await api.patch(`/bookings/${id}/serve`);
};

export const noShowBooking = async (id: string): Promise<void> => {
  await api.patch(`/bookings/${id}/no-show`);
};
