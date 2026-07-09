import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  // Transform heatmap data for Custom Matrix
  const businessUnits = Array.from(new Set(heatmap.map(h => h.business_unit)));
  const riskLevels = ["LOW", "MEDIUM", "HIGH"] as const; // Left to right order
  
  // Calculate max count for opacity scaling
  const maxCount = Math.max(1, ...heatmap.map(h => h.count));
  
  const getRiskLabel = (level: string) => {
    if (level === "HIGH") return "Tinggi";
    if (level === "MEDIUM") return "Sedang";
    return "Rendah";
  };

  const getBaseColor = (level: string) => {
    if (level === "HIGH") return "var(--destructive)";
    if (level === "MEDIUM") return "#f97316"; // orange-500
    if (level === "LOW") return "#10b981"; // emerald-500
    return "var(--muted)";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.3 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 h-full"
    >
      {/* Custom Risk Heatmap */}
      <Card className="shadow-sm border-border/50 rounded-2xl backdrop-blur-sm bg-card/80 flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-chart-4/10">
              <ShieldAlert className="h-5 w-5 text-chart-4" />
            </div>
            Legal Risk Heatmap
          </CardTitle>
          <CardDescription>Peta suhu risiko berdasarkan unit bisnis.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="h-full min-h-[250px] flex flex-col justify-center">
            {businessUnits.length > 0 ? (
              <div className="w-full overflow-x-auto pb-2 flex-1 flex flex-col justify-center">
                <div className="min-w-[300px]">
                  {/* Matrix Header */}
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <div className="col-span-1"></div>
                    {riskLevels.map(level => (
                      <div key={level} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {getRiskLabel(level)}
                      </div>
                    ))}
                  </div>
                  
                  {/* Matrix Rows */}
                  <div className="space-y-2">
                    {businessUnits.map(bu => (
                      <div key={bu} className="grid grid-cols-4 gap-2 items-center">
                        <div className="col-span-1 text-xs font-medium text-foreground truncate pr-2" title={bu}>
                          {bu || 'Unknown'}
                        </div>
                        {riskLevels.map(level => {
                          const cellData = heatmap.find(h => h.business_unit === bu && h.risk_level === level);
                          const count = cellData?.count || 0;
                          const intensity = count === 0 ? 0 : Math.max(0.15, count / maxCount);
                          const isDark = intensity > 0.5;
                          
                          return (
                            <div 
                              key={`${bu}-${level}`} 
                              className="relative group p-2 flex items-center justify-center h-10 rounded-md border border-border/40 overflow-hidden cursor-help transition-transform hover:scale-[1.05]"
                              title={`${bu} - Risiko ${getRiskLabel(level)}: ${count} Kontrak`}
                            >
                              <div 
                                className="absolute inset-0 transition-opacity"
                                style={{ 
                                  backgroundColor: getBaseColor(level),
                                  opacity: intensity 
                                }} 
                              />
                              <span className={`relative z-10 text-xs font-bold ${count === 0 ? 'text-muted-foreground/50' : (isDark ? 'text-white' : 'text-foreground')}`}>
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState title="Tidak Ada Data Risiko" icon={BarChart4} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expiring Contracts */}
      <Card className="shadow-sm border-border/50 rounded-2xl backdrop-blur-sm bg-card/80 flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <FileWarning className="h-5 w-5 text-orange-500" />
            </div>
            Kontrak Akan Berakhir
          </CardTitle>
          <CardDescription>Daftar kontrak yang membutuhkan perhatian segera.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col">
          <div className="space-y-4 h-full overflow-y-auto pr-4 scrollbar-thin">
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
