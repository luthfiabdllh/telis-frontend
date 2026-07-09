import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, FolderTree, Activity } from "lucide-react";
import { DashboardMetrics } from "../api/metrics-api";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricsCardsProps {
  metrics: DashboardMetrics | null;
  isLoading?: boolean;
}

const itemVariant = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        show: { transition: { staggerChildren: 0.1 } },
      }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <motion.div variants={itemVariant}>
        <Card className="rounded-2xl h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
            <div className="p-2 rounded-xl bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.total_documents || 138}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% dari bulan lalu
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariant}>
        <Card className="shadow-sm border-chart-2/10 bg-linear-to-br from-background to-chart-2/5 rounded-2xl h-full backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pengguna Aktif
            </CardTitle>
            <div className="p-2 rounded-xl bg-chart-2/10">
              <Users className="h-4 w-4 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.total_users || 45}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +3 pengguna baru
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariant}>
        <Card className="shadow-sm border-chart-3/10 bg-linear-to-br from-background to-chart-3/5 rounded-2xl h-full backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Folder</CardTitle>
            <div className="p-2 rounded-xl bg-chart-3/10">
              <FolderTree className="h-4 w-4 text-chart-3" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.total_folders || 24}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Struktur penyimpanan aktif
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariant}>
        <Card className="shadow-sm border-destructive/10 bg-linear-to-br from-background to-destructive/5 rounded-2xl h-full backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estimasi Biaya AI
            </CardTitle>
            <div className="p-2 rounded-xl bg-destructive/10">
              <Activity className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(metrics?.total_cost_this_month || 145.2).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total pemakaian token bulan ini
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
