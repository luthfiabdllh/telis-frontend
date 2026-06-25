import { useQuery } from '@tanstack/react-query';
import { metricsApi } from '../api/metrics-api';

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => metricsApi.getDashboardMetrics(),
    refetchInterval: 300000, // 5 minutes
  });
};

export const useMyMetrics = () => {
  return useQuery({
    queryKey: ['my-metrics'],
    queryFn: () => metricsApi.getMyMetrics(),
    staleTime: 60000, // 1 minute
  });
};
