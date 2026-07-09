import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { RiskHeatmap, ExpiringContract } from "../api/metrics-api";
import { motion } from "framer-motion";
import { ShieldAlert, FileWarning, BarChart4, FileQuestion } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface RiskAndContractsProps {
  heatmap: RiskHeatmap[];
  expiringContracts: ExpiringContract[];
  isLoading?: boolean;
}

const RISK_COLORS: Record<string, string> = {
  HIGH: "var(--destructive)",
  MEDIUM: "var(--chart-3)", 
  LOW: "var(--chart-2)", 
  UNKNOWN: "var(--muted-foreground)"
};

const EmptyState = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-muted/10 rounded-xl border border-dashed border-muted-foreground/20">
    <div className="p-4 bg-muted/20 rounded-full mb-3">
      <Icon className="w-8 h-8 text-muted-foreground opacity-50" />
    </div>
    <p className="text-sm font-medium text-foreground">{title}</p>
  </div>
);

export function RiskAndContracts({ heatmap, expiringContracts, isLoading }: RiskAndContractsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Skeleton className="h-[400px] rounded-2xl" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    );
  }

  // Transform heatmap data for BarChart
  const businessUnits = Array.from(new Set(heatmap.map(h => h.business_unit)));
  const barData = businessUnits.map(bu => {
    const dataObj: any = { name: bu || 'Unknown' };
    heatmap.filter(h => h.business_unit === bu).forEach(h => {
      dataObj[h.risk_level] = h.count;
    });
    return dataObj;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.3 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-2"
    >
      {/* Risk Heatmap */}
      <Card className="shadow-sm border-border/50 rounded-2xl backdrop-blur-sm bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-chart-4/10">
              <ShieldAlert className="h-5 w-5 text-chart-4" />
            </div>
            Legal Risk Heatmap
          </CardTitle>
          <CardDescription>Tingkat risiko berdasarkan unit bisnis.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {barData.length > 0 ? (
              <ChartContainer config={{}} className="h-full w-full">
                <BarChart data={barData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <ChartTooltip cursor={{fill: 'var(--muted)'}} content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="HIGH" stackId="a" fill={RISK_COLORS["HIGH"]} radius={[0, 0, 4, 4]} />
                  <Bar dataKey="MEDIUM" stackId="a" fill={RISK_COLORS["MEDIUM"]} />
                  <Bar dataKey="LOW" stackId="a" fill={RISK_COLORS["LOW"]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyState title="Tidak Ada Data Risiko" icon={BarChart4} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expiring Contracts */}
      <Card className="shadow-sm border-border/50 rounded-2xl backdrop-blur-sm bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <FileWarning className="h-5 w-5 text-orange-500" />
            </div>
            Kontrak Akan Berakhir
          </CardTitle>
          <CardDescription>Daftar kontrak yang membutuhkan perhatian segera.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin">
            {expiringContracts.length > 0 ? (
              expiringContracts.map((contract, idx) => (
                <motion.div 
                  key={contract.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex flex-col gap-1.5 border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <p className="text-sm font-medium leading-none line-clamp-1 group-hover:text-primary transition-colors cursor-default" title={contract.filename}>
                    {contract.filename}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="bg-muted px-2 py-0.5 rounded-md">{contract.vendor_name || 'Tanpa Vendor'}</span>
                    <span className="text-destructive font-semibold bg-destructive/10 px-2 py-0.5 rounded-md">
                      {formatDistanceToNow(parseISO(contract.expiry_date), { addSuffix: true, locale: id })}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <EmptyState title="Tidak Ada Kontrak Mendesak" icon={FileQuestion} />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
