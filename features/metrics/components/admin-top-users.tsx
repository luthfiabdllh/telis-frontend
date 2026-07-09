import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DashboardMetrics } from "../api/metrics-api";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Users } from "lucide-react";

interface AdminTopUsersProps {
  metrics: DashboardMetrics | null;
  isLoading?: boolean;
}

const ANOMALY_THRESHOLD = 5.00;

const EmptyState = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-muted/10 rounded-xl border border-dashed border-muted-foreground/20">
    <div className="p-4 bg-muted/20 rounded-full mb-3">
      <Icon className="w-8 h-8 text-muted-foreground opacity-50" />
    </div>
    <p className="text-sm font-medium text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Belum ada pengguna yang menggunakan layanan AI.</p>
  </div>
);

export function AdminTopUsers({ metrics, isLoading }: AdminTopUsersProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm border-border/50 rounded-2xl h-[400px] backdrop-blur-sm bg-card/80">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasData = metrics?.top_users && metrics.top_users.length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="h-full flex flex-col shadow-sm border-border/50 rounded-2xl backdrop-blur-sm bg-card/80 overflow-hidden">
        <CardHeader>
          <CardTitle>Pengguna Teratas (Top Users)</CardTitle>
          <CardDescription>5 Pengguna dengan pemakaian token tertinggi.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0 px-6 pb-6">
          {!hasData ? (
            <div className="h-[300px]">
              <EmptyState title="Tidak Ada Pengguna" icon={Users} />
            </div>
          ) : (
            <div className="h-[300px] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead>Nama Pengguna</TableHead>
                    <TableHead className="text-right">Biaya (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.top_users.map((user) => {
                    const isAnomaly = user.total_cost >= ANOMALY_THRESHOLD;
                    return (
                      <TableRow 
                        key={user.user_id} 
                        className={`border-border/50 transition-colors ${
                          isAnomaly 
                            ? "bg-destructive/10 hover:bg-destructive/20" 
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <TableCell className="py-3">
                          <div className="font-medium flex items-center gap-2">
                            {user.name || user.email}
                            {isAnomaly && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shadow-xs h-4">
                                <AlertTriangle className="w-3 h-3 mr-1" /> High Usage
                              </Badge>
                            )}
                          </div>
                          <div className={`text-xs mt-0.5 ${isAnomaly ? 'text-destructive/80' : 'text-muted-foreground'}`}>
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${isAnomaly ? 'text-destructive' : ''}`}>
                          ${user.total_cost.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
