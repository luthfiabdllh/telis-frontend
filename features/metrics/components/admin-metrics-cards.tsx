import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, FileText, FolderOpen } from "lucide-react";
import { DashboardMetrics } from "../api/metrics-api";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminMetricsCardsProps {
  metrics: DashboardMetrics | null;
  isLoading?: boolean;
}

const itemVariant = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export function AdminMetricsCards({
  metrics,
  isLoading,
}: AdminMetricsCardsProps) {
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
        <Card className="shadow-sm border-primary/10 rounded-2xl h-full backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Biaya LLM
            </CardTitle>
            <div className="p-2 rounded-xl bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ${(metrics?.total_cost_this_month || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariant}>
        <Card className="shadow-sm border-border/50 rounded-2xl h-full backdrop-blur-sm bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengguna
            </CardTitle>
            <div className="p-2 rounded-xl bg-muted">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metrics?.total_users || 0}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariant}>
        <Card className="shadow-sm border-border/50 rounded-2xl h-full backdrop-blur-sm bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
            <div className="p-2 rounded-xl bg-muted">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metrics?.total_documents || 0}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariant}>
        <Card className="shadow-sm border-border/50 rounded-2xl h-full backdrop-blur-sm bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Direktori
            </CardTitle>
            <div className="p-2 rounded-xl bg-muted">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metrics?.total_folders || 0}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
