import { useQuery } from '@tanstack/react-query';
import { metricsApi } from '../api/metrics-api';

export const useDashboardMetrics = (params?: { start_date?: string; end_date?: string }) => {
  return useQuery({
    queryKey: ['dashboard-metrics', params],
    queryFn: () => metricsApi.getDashboardMetrics(params),
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

export const useRiskHeatmap = () => {
  return useQuery({
    queryKey: ['risk-heatmap'],
    queryFn: () => metricsApi.getRiskHeatmap(),
  });
};

export const useExpiringContracts = () => {
  return useQuery({
    queryKey: ['expiring-contracts'],
    queryFn: () => metricsApi.getExpiringContracts(),
  });
};
