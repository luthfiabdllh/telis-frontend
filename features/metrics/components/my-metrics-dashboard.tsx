"use client";

import { useMyMetrics } from "../hooks/use-metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, AlertTriangle } from "lucide-react";

export function MyMetricsDashboard() {
  const { data, isLoading, isError } = useMyMetrics();

  if (isLoading) {
    return <Skeleton className="h-[120px] w-full max-w-md" />;
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-destructive border rounded-xl bg-destructive/10 max-w-md">
        <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Gagal memuat data metrik</h3>
      </div>
    );
  }

  return (
    <Card className="bg-linear-to-br from-primary/10 to-transparent border-primary/20 max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Total Pemakaian Saya (Bulan Ini)
        </CardTitle>
        <DollarSign className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-primary">
          ${data.total_cost_this_month.toFixed(2)}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Estimasi biaya token AI yang Anda gunakan sepanjang bulan ini.
        </p>
      </CardContent>
    </Card>
  );
}
