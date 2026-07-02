import { useQuery } from '@tanstack/react-query';
import { fetchSlots } from '../api/slots.api';

export const useSlots = (appointmentTypeId: string, dateStr: string) => {
  return useQuery({
    queryKey: ['slots', appointmentTypeId, dateStr],
    queryFn: () => fetchSlots(appointmentTypeId, dateStr),
    enabled: !!appointmentTypeId && !!dateStr,
  });
};
