import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyBookings, createBooking, cancelBooking, fetchBooking, fetchQueueSnapshot } from '../api/bookings.api';
import { useToastStore } from '../stores/toast.store';
import { Slot } from '../api/slots.api';

export const useMyBookings = (status?: string) => {
  return useQuery({
    queryKey: ['myBookings', { status }],
    queryFn: () => fetchMyBookings(status),
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => fetchBooking(id),
    enabled: !!id,
  });
};

export const useQueueSnapshot = (slotId: string) => {
  return useQuery({
    queryKey: ['queueSnapshot', slotId],
    queryFn: () => fetchQueueSnapshot(slotId),
    enabled: !!slotId,
    refetchInterval: 30000, // Poll every 30s as a fallback for Phase 6
  });
};

export const useCreateBooking = (appointmentTypeId: string, dateStr: string) => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  return useMutation({
    mutationFn: (slotId: string) => createBooking(slotId),
    onMutate: async (slotId: string) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['slots', appointmentTypeId, dateStr] });

      // Snapshot the previous value
      const previousSlots = queryClient.getQueryData<Slot[]>(['slots', appointmentTypeId, dateStr]);

      // Optimistically update to the new value
      if (previousSlots) {
        queryClient.setQueryData<Slot[]>(['slots', appointmentTypeId, dateStr], (old) => 
          old?.map(slot => 
            slot.id === slotId 
              ? { 
                  ...slot, 
                  remainingCapacity: Math.max(0, slot.remainingCapacity - 1),
                  status: slot.remainingCapacity - 1 <= 0 ? 'FULL' : slot.status
                } 
              : slot
          )
        );
      }

      // Return a context object with the snapshotted value
      return { previousSlots };
    },
    onError: (err: any, slotId, context) => {
      // Rollback to the previous value
      if (context?.previousSlots) {
        queryClient.setQueryData(['slots', appointmentTypeId, dateStr], context.previousSlots);
      }
      
      // Handle graceful 409 SlotFullException
      if (err.response?.status === 409) {
        showToast({ message: 'This slot just filled up. Please pick another one.', type: 'error' });
      } else {
        showToast({ message: err.response?.data?.message || 'Failed to book slot', type: 'error' });
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync
      queryClient.invalidateQueries({ queryKey: ['slots', appointmentTypeId, dateStr] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
    onSuccess: () => {
      showToast({ message: 'Booking confirmed!', type: 'success' });
    }
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  return useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['myBookings'] });
      await queryClient.cancelQueries({ queryKey: ['booking', id] });
    },
    onError: (err: any) => {
      showToast({ message: err.response?.data?.message || 'Failed to cancel booking', type: 'error' });
    },
    onSettled: (data, error, id) => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['slots'] }); // Invalidating all slots just in case
    },
    onSuccess: () => {
      showToast({ message: 'Booking cancelled.', type: 'info' });
    }
  });
};
