"use client";

import { useDashboardMetrics } from "../hooks/use-metrics";
import { AdminMetricsCards } from "./admin-metrics-cards";
import { AdminUsageChart } from "./admin-usage-chart";
import { AdminTopUsers } from "./admin-top-users";
import { AdminDemographicsCharts } from "./admin-demographics-charts";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

import { DateRange } from "react-day-picker";
import { subDays, format } from "date-fns";
import { useState } from "react";

export function MetricsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const queryParams = {
    start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  };

  const { data: metrics, isLoading, isError } = useDashboardMetrics(queryParams);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-destructive/5 text-destructive border border-destructive/20 rounded-2xl w-full">
        <AlertCircle className="w-12 h-12 mb-4 opacity-80" />
        <h3 className="font-semibold text-2xl mb-2">Gagal Memuat Data</h3>
        <p className="text-destructive/80 max-w-md mx-auto">
          Data metrik gagal dimuat dari server. Pastikan Anda memiliki wewenang Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 w-full max-w-full">
      {/* KPI Cards section */}
      <AdminMetricsCards metrics={metrics || null} isLoading={isLoading} />

      {/* Full width row for Daily Trend */}
      <div className="w-full">
        <AdminUsageChart 
          metrics={metrics || null} 
          isLoading={isLoading} 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>
      {/* Grid for Top Users and Demographics in one row */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <div className="col-span-1 h-full">
          <AdminTopUsers metrics={metrics || null} isLoading={isLoading} />
        </div>
        <AdminDemographicsCharts metrics={metrics || null} isLoading={isLoading} />
      </div>
    </div>
  );
}
