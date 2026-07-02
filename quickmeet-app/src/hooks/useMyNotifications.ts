import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyNotifications, markNotificationAsRead } from '../api/notifications.api';
import { useToastStore } from '../stores/toast.store';

export function useMyNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getMyNotifications,
    refetchInterval: 60000, // Poll every minute as fallback
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      useToastStore.getState().show({ message: err.response?.data?.message || 'Failed to mark notification as read', type: 'error' });
    }
  });
}
