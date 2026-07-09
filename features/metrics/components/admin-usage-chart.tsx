import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardMetrics } from "../api/metrics-api";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface AdminUsageChartProps {
  metrics: DashboardMetrics | null;
  isLoading?: boolean;
  dateRange?: DateRange;
  onDateRangeChange?: (date: DateRange | undefined) => void;
}

const EmptyState = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-muted/10 rounded-xl border border-dashed border-muted-foreground/20">
    <div className="p-4 bg-muted/20 rounded-full mb-3">
      <Icon className="w-8 h-8 text-muted-foreground opacity-50" />
    </div>
    <p className="text-sm font-medium text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Belum ada data pemakaian bulan ini.</p>
  </div>
);

export function AdminUsageChart({ metrics, isLoading, dateRange, onDateRangeChange }: AdminUsageChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-2xl" />;
  }

  const chartConfig = {
    cost_usd: {
      label: "Biaya (USD)",
      color: "var(--primary)",
    }
  };

  const hasData = metrics?.daily_trend && metrics.daily_trend.length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="h-full shadow-sm border-border/50 rounded-2xl backdrop-blur-sm bg-card/80">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
          <div className="space-y-1.5">
            <CardTitle>Tren Pemakaian Harian</CardTitle>
            <CardDescription>Biaya LLM harian selama bulan ini.</CardDescription>
          </div>
          <DatePickerWithRange date={dateRange} onDateChange={onDateRangeChange} />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {hasData ? (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart data={metrics.daily_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAdminCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--muted-foreground)"
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => {
                      const d = new Date(value);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                    fontSize={11}
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)"
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`}
                    fontSize={11}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="cost_usd" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAdminCost)" />
                </AreaChart>
              </ChartContainer>
            ) : (
              <EmptyState title="Tidak Ada Pemakaian" icon={Activity} />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
