"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { metricsApi, RiskHeatmap, ExpiringContract, RegulatoryImpact } from "@/features/metrics/api/metrics-api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { formatDistanceToNow, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { AlertCircle, FileWarning, ShieldAlert } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const RISK_COLORS: Record<string, string> = {
  HIGH: "#ef4444",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
  UNKNOWN: "#94a3b8"
};

export default function AnalyticsDashboardPage() {
  const [heatmap, setHeatmap] = useState<RiskHeatmap[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<ExpiringContract[]>([]);
  const [regulatoryImpacts, setRegulatoryImpacts] = useState<RegulatoryImpact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hm, ec, ri] = await Promise.all([
          metricsApi.getRiskHeatmap(),
          metricsApi.getExpiringContracts(),
          metricsApi.getRegulatoryImpacts()
        ]);
        setHeatmap(hm || []);
        setExpiringContracts(ec || []);
        setRegulatoryImpacts(ri || []);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Memuat dashboard analitik...</p>
      </div>
    );
  }

  // Transform heatmap data for BarChart
  const businessUnits = Array.from(new Set(heatmap.map(h => h.business_unit)));
  const barData = businessUnits.map(bu => {
    const dataObj: any = { name: bu };
    heatmap.filter(h => h.business_unit === bu).forEach(h => {
      dataObj[h.risk_level] = h.count;
    });
    return dataObj;
  });

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Wawasan tingkat risiko, kontrak kadaluarsa, dan dampak regulasi.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Risk Heatmap */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-indigo-500" />
              Legal Risk Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="HIGH" stackId="a" fill={RISK_COLORS["HIGH"]} />
                    <Bar dataKey="MEDIUM" stackId="a" fill={RISK_COLORS["MEDIUM"]} />
                    <Bar dataKey="LOW" stackId="a" fill={RISK_COLORS["LOW"]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Tidak ada data risiko
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Contracts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-orange-500" />
              Kontrak Akan Berakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {expiringContracts.length > 0 ? (
                expiringContracts.map((contract) => (
                  <div key={contract.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-medium leading-none line-clamp-1" title={contract.filename}>
                      {contract.filename}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{contract.vendor_name || 'Tanpa Vendor'}</span>
                      <span className="text-red-500 font-semibold">
                        {formatDistanceToNow(parseISO(contract.expiry_date), { addSuffix: true, locale: id })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center pt-4">
                  Tidak ada kontrak yang mendesak.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Regulatory Impacts */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Dampak Regulasi Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {regulatoryImpacts.length > 0 ? (
                regulatoryImpacts.map((impact) => (
                  <div key={impact.id} className="rounded-lg border p-4 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${impact.impact_level === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {impact.impact_level} IMPACT
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(parseISO(impact.created_at), { addSuffix: true, locale: id })}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mt-1 line-clamp-2">{impact.regulation_name}</p>
                    <div className="mt-auto pt-2 border-t text-xs text-muted-foreground">
                      Berdampak pada: <span className="font-medium text-foreground">{impact.internal_document_name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-sm text-muted-foreground text-center py-8">
                  Belum ada dokumen internal yang terdampak regulasi baru.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
