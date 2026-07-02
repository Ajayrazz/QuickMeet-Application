import { useMutation } from '@tanstack/react-query';
import { serveBooking, noShowBooking } from '../api/adminQueue.api';
import { useToastStore } from '../stores/toast.store';

export function useAdminQueueActions() {
  const showToast = useToastStore(state => state.show);

  const serveMutation = useMutation({
    mutationFn: (bookingId: string) => serveBooking(bookingId),
    onSuccess: () => {
      // Intentionally NOT invalidating queries. The socket queue:update is the single source of truth.
    },
    onError: (err: any) => {
      showToast({ message: err.response?.data?.message || 'Failed to call next', type: 'error' });
    }
  });

  const noShowMutation = useMutation({
    mutationFn: (bookingId: string) => noShowBooking(bookingId),
    onSuccess: () => {
      // Again, rely on socket for state sync
    },
    onError: (err: any) => {
      showToast({ message: err.response?.data?.message || 'Failed to mark no-show', type: 'error' });
    }
  });

  return {
    serveBooking: serveMutation.mutate,
    isServing: serveMutation.isPending,
    servingId: serveMutation.variables,
    markNoShow: noShowMutation.mutate,
    isMarkingNoShow: noShowMutation.isPending,
    noShowId: noShowMutation.variables,
  };
}
