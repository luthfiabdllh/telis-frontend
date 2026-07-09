"use client";

import { useState } from "react";
import { useDashboardMetrics, useRiskHeatmap, useExpiringContracts } from "../hooks/use-metrics";
import { MetricsCards } from "./metrics-cards";
import { AnalyticsAreaChart, AnalyticsDonutChart } from "./analytics-charts";
import { RiskAndContracts } from "./risk-and-contracts";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DateRange } from "react-day-picker";
import { subDays, format } from "date-fns";

export function AnalyticsDashboardContainer() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const queryParams = {
    start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  };

  const { data: dashboardMetrics, isLoading: isLoadingDashboard, isError: isErrorDashboard } = useDashboardMetrics(queryParams);
  const { data: heatmap, isLoading: isLoadingHeatmap, isError: isErrorHeatmap } = useRiskHeatmap();
  const { data: expiringContracts, isLoading: isLoadingContracts, isError: isErrorContracts } = useExpiringContracts();

  const isAnyError = isErrorDashboard || isErrorHeatmap || isErrorContracts;

  if (isAnyError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-destructive/5 text-destructive border border-destructive/20 rounded-2xl w-full">
        <AlertCircle className="w-12 h-12 mb-4 opacity-80" />
        <h3 className="font-semibold text-2xl mb-2">Gagal Memuat Data</h3>
        <p className="text-destructive/80 max-w-md mx-auto">
          Terjadi kesalahan saat mengambil metrik analitik. Pastikan Anda memiliki wewenang untuk melihat data ini.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 w-full">

      {/* KPI Cards section */}
      <MetricsCards metrics={dashboardMetrics || null} isLoading={isLoadingDashboard} />

      {/* Area Chart Full Row */}
      <div className="w-full">
        <AnalyticsAreaChart 
          metrics={dashboardMetrics || null} 
          isLoading={isLoadingDashboard}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* Grid for Donut Chart, Risk Heatmap & Contracts */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <div className="col-span-1">
          <AnalyticsDonutChart metrics={dashboardMetrics || null} isLoading={isLoadingDashboard} />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <RiskAndContracts 
            heatmap={heatmap || []} 
            expiringContracts={expiringContracts || []} 
            isLoading={isLoadingHeatmap || isLoadingContracts} 
          />
        </div>
      </div>
    </div>
  );
}
