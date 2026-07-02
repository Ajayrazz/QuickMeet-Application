import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSlot, updateSlot, CreateSlotDto, UpdateSlotDto } from '../api/adminSlots.api';
import { useToastStore } from '../stores/toast.store';
import { format } from 'date-fns';

export function useCreateSlot(appointmentTypeId: string, date: Date) {
  const queryClient = useQueryClient();
  const showToast = useToastStore(state => state.show);
  const dateStr = format(date, 'yyyy-MM-dd');

  return useMutation({
    mutationFn: (dto: Omit<CreateSlotDto, 'appointmentTypeId'>) => 
      createSlot({ ...dto, appointmentTypeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots', appointmentTypeId, dateStr] });
      showToast({ message: 'Slot created successfully!', type: 'success' });
    },
    onError: (err: any) => {
      showToast({ message: err.response?.data?.message || 'Failed to create slot', type: 'error' });
    }
  });
}

export function useUpdateSlot(appointmentTypeId: string, date: Date) {
  const queryClient = useQueryClient();
  const showToast = useToastStore(state => state.show);
  const dateStr = format(date, 'yyyy-MM-dd');

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSlotDto }) => updateSlot(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots', appointmentTypeId, dateStr] });
      showToast({ message: 'Slot updated successfully!', type: 'success' });
    },
    onError: (err: any) => {
      showToast({ message: err.response?.data?.message || 'Failed to update slot', type: 'error' });
    }
  });
}
