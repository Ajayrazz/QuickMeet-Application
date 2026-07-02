import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAppointmentTypes } from '../api/appointmentTypes.api';
import { createAppointmentType, updateAppointmentType, CreateAppointmentTypeDto, UpdateAppointmentTypeDto } from '../api/adminAppointmentTypes.api';
import { useAuthStore } from '../stores/auth.store';
import { useToastStore } from '../stores/toast.store';

export function useMyAppointmentTypes() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['adminAppointmentTypes', user?.id],
    queryFn: async () => {
      // Fetch appointment types and filter by adminId since there's no dedicated backend route
      const response = await fetchAppointmentTypes();
      return response.filter((at: any) => at.adminId === user?.id);
    },
    enabled: !!user?.id,
  });
}

export function useCreateAppointmentType() {
  const queryClient = useQueryClient();
  const showToast = useToastStore(state => state.show);

  return useMutation({
    mutationFn: (dto: CreateAppointmentTypeDto) => createAppointmentType(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAppointmentTypes'] });
      showToast({ message: 'Service created successfully!', type: 'success' });
    },
    onError: (err: any) => {
      showToast({ message: err.response?.data?.message || 'Failed to create service', type: 'error' });
    }
  });
}

export function useUpdateAppointmentType(id: string) {
  const queryClient = useQueryClient();
  const showToast = useToastStore(state => state.show);

  return useMutation({
    mutationFn: (dto: UpdateAppointmentTypeDto) => updateAppointmentType(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAppointmentTypes'] });
      queryClient.invalidateQueries({ queryKey: ['appointmentType', id] });
      showToast({ message: 'Service updated successfully!', type: 'success' });
    },
    onError: (err: any) => {
      showToast({ message: err.response?.data?.message || 'Failed to update service', type: 'error' });
    }
  });
}
