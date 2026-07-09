import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { DashboardMetrics } from "../api/metrics-api";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart as PieChartIcon, Shield } from "lucide-react";

interface AdminDemographicsChartsProps {
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
    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Data tidak tersedia.</p>
  </div>
);

export function AdminDemographicsCharts({ metrics, isLoading }: AdminDemographicsChartsProps) {
  if (isLoading) {
    return (
      <>
        <div className="h-full">
          <Card className="h-full flex flex-col shadow-sm border-border/50 rounded-2xl backdrop-blur-sm bg-card/80">
            <CardHeader><Skeleton className="h-6 w-48 mb-2" /><Skeleton className="h-4 w-64" /></CardHeader>
            <CardContent className="flex-1 pb-6"><Skeleton className="h-[250px] w-[250px] rounded-full mx-auto" /></CardContent>
          </Card>
        </div>
        <div className="h-full">
          <Card className="h-full flex flex-col shadow-sm border-border/50 rounded-2xl backdrop-blur-sm bg-card/80">
            <CardHeader><Skeleton className="h-6 w-48 mb-2" /><Skeleton className="h-4 w-64" /></CardHeader>
            <CardContent className="flex-1 pb-6"><Skeleton className="h-[250px] w-[250px] rounded-full mx-auto" /></CardContent>
          </Card>
        </div>
      </>
    );
  }

  const docDist = metrics?.doc_status_dist || [];
  const roleDist = metrics?.user_role_dist || [];

  return (
    <>
      {/* Document Status */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }}
        className="h-full"
      >
        <Card className="h-full flex flex-col shadow-sm border-border/50 rounded-2xl backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle>Distribusi Status Dokumen</CardTitle>
            <CardDescription>Komposisi dokumen berdasarkan status ingestion.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-6">
            <div className="h-[250px] flex items-center justify-center">
              {docDist.length > 0 ? (
                <ChartContainer config={{}} className="h-full w-full">
                  <PieChart>
                    <Pie
                      data={docDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="status"
                      stroke="none"
                    >
                      {docDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <EmptyState title="Tidak Ada Dokumen" icon={PieChartIcon} />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Roles */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.5 }}
        className="h-full"
      >
        <Card className="h-full flex flex-col shadow-sm border-border/50 rounded-2xl backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle>Demografi Wewenang Pengguna</CardTitle>
            <CardDescription>Sebaran peran (role) pengguna dalam sistem.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-6">
            <div className="h-[250px] flex items-center justify-center">
              {roleDist.length > 0 ? (
                <ChartContainer config={{}} className="h-full w-full">
                  <PieChart>
                    <Pie
                      data={roleDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="role"
                      stroke="none"
                    >
                      {roleDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <EmptyState title="Tidak Ada Pengguna" icon={Shield} />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
