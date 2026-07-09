import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { DashboardMetrics } from "../api/metrics-api";
import { motion } from "framer-motion";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsChartsProps {
  metrics: DashboardMetrics | null;
  isLoading?: boolean;
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const EmptyState = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-muted/10 rounded-xl border border-dashed border-muted-foreground/20">
    <div className="p-4 bg-muted/20 rounded-full mb-3">
      <Icon className="w-8 h-8 text-muted-foreground opacity-50" />
    </div>
    <p className="text-sm font-medium text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Belum ada data yang cukup untuk divisualisasikan.</p>
  </div>
);

export function AnalyticsCharts({ metrics, isLoading }: AnalyticsChartsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
        <Skeleton className="col-span-4 h-[400px] rounded-2xl" />
        <Skeleton className="col-span-3 h-[400px] rounded-2xl" />
      </div>
    );
  }

  const dailyTrend = metrics?.daily_trend?.length ? metrics.daily_trend : [];
  const docStatusDist = metrics?.doc_status_dist?.length ? metrics.doc_status_dist : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.2 }}
      className="grid gap-4 md:grid-cols-7 lg:grid-cols-7"
    >
      {/* Cost Over Time Area Chart */}
      <Card className="col-span-1 md:col-span-7 lg:col-span-4 shadow-sm border-border/50 rounded-2xl backdrop-blur-sm bg-card/80">
        <CardHeader>
          <CardTitle>Pemakaian Token (30 Hari Terakhir)</CardTitle>
          <CardDescription>Tren pengeluaran token AI secara global dalam USD.</CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          <div className="h-[300px] w-full pr-4">
            {dailyTrend.length > 0 ? (
              <ChartContainer config={{}} className="h-full w-full">
                <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="cost_usd" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
              </ChartContainer>
            ) : (
              <EmptyState title="Tidak Ada Data Pemakaian" icon={BarChart3} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution Donut Chart */}
      <Card className="col-span-1 md:col-span-7 lg:col-span-3 shadow-sm border-border/50 rounded-2xl backdrop-blur-sm bg-card/80">
        <CardHeader>
          <CardTitle>Status Pemrosesan Dokumen</CardTitle>
          <CardDescription>Distribusi status dokumen yang diunggah.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            {docStatusDist.length > 0 ? (
              <ChartContainer config={{}} className="h-full w-full">
                <PieChart>
                  <Pie
                    data={docStatusDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                    stroke="none"
                  >
                    {docStatusDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <EmptyState title="Tidak Ada Data Dokumen" icon={PieChartIcon} />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
