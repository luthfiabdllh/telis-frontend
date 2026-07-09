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

  return (
    <div className="flex flex-col space-y-6 w-full">
      {isAnyError && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gagal Memuat Data</AlertTitle>
          <AlertDescription>
            Beberapa metrik gagal dimuat dari server. Silakan muat ulang halaman.
          </AlertDescription>
        </Alert>
      )}

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
