import { apiClient as api } from './client';

export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  relatedBookingId: string | null;
  readAt: string | null;
  createdAt: string;
}

export const getMyNotifications = async (): Promise<NotificationDto[]> => {
  const { data } = await api.get<{ data: NotificationDto[] }>('/notifications/me');
  return data.data; // Backend returns a paginated { data, meta } object
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};
