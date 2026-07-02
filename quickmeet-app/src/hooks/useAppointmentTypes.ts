import { useQuery } from '@tanstack/react-query';
import { fetchAppointmentTypes, fetchAppointmentType } from '../api/appointmentTypes.api';

export const useAppointmentTypes = (search?: string, category?: string) => {
  return useQuery({
    queryKey: ['appointmentTypes', { search, category }],
    queryFn: () => fetchAppointmentTypes(search, category),
  });
};

export const useAppointmentType = (id: string) => {
  return useQuery({
    queryKey: ['appointmentType', id],
    queryFn: () => fetchAppointmentType(id),
    enabled: !!id,
  });
};
