import { apiClient as api } from './client';
import { useQuery } from '@tanstack/react-query';

export interface AnalyticsOverviewDto {
  totalBookings: number;
  noShowCount: number;
  servedCount: number;
  cancelledCount: number;
  avgWaitTimeMinutes: number;
  bookingsPerDay: {
    date: string; // YYYY-MM-DD
    count: number;
  }[];
}

export const getAnalyticsOverview = async (
  appointmentTypeId?: string,
  startDate?: string,
  endDate?: string
): Promise<AnalyticsOverviewDto> => {
  const params = new URLSearchParams();
  if (appointmentTypeId) params.append('appointmentTypeId', appointmentTypeId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const { data } = await api.get<AnalyticsOverviewDto>(`/analytics/overview?${params.toString()}`);
  return data;
};

export function useAnalytics(appointmentTypeId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['analytics', appointmentTypeId, startDate, endDate],
    queryFn: () => getAnalyticsOverview(appointmentTypeId, startDate, endDate),
  });
}
