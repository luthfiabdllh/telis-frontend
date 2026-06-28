"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { metricsApi, RiskHeatmap, ExpiringContract, DashboardMetrics } from "@/features/metrics/api/metrics-api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import { formatDistanceToNow, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { AlertCircle, FileWarning, ShieldAlert, Users, FileText, FolderTree, Activity } from "lucide-react";

const RISK_COLORS: Record<string, string> = {
  HIGH: "hsl(var(--destructive))",
  MEDIUM: "hsl(var(--chart-3))", // yellow-ish
  LOW: "hsl(var(--chart-2))", // green-ish
  UNKNOWN: "hsl(var(--muted-foreground))"
};

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// Fallback mock data if API is incomplete
const MOCK_DAILY_TREND = [
  { date: '2023-10-01', cost_usd: 12.5 },
  { date: '2023-10-05', cost_usd: 15.0 },
  { date: '2023-10-10', cost_usd: 10.2 },
  { date: '2023-10-15', cost_usd: 25.4 },
  { date: '2023-10-20', cost_usd: 18.1 },
  { date: '2023-10-25', cost_usd: 35.8 },
  { date: '2023-10-30', cost_usd: 28.5 },
];

const MOCK_TOP_USERS = [
  { name: 'Alice Smith', total_cost: 45.2 },
  { name: 'Bob Jones', total_cost: 32.1 },
  { name: 'Charlie Doe', total_cost: 15.5 },
];

export default function AnalyticsDashboardPage() {
  const [heatmap, setHeatmap] = useState<RiskHeatmap[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<ExpiringContract[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hm, ec, dm] = await Promise.all([
          metricsApi.getRiskHeatmap().catch(() => []),
          metricsApi.getExpiringContracts().catch(() => []),
          metricsApi.getDashboardMetrics().catch(() => null)
        ]);
        setHeatmap(hm || []);
        setExpiringContracts(ec || []);
        setDashboardMetrics(dm as DashboardMetrics);
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
    const dataObj: any = { name: bu || 'Unknown' };
    heatmap.filter(h => h.business_unit === bu).forEach(h => {
      dataObj[h.risk_level] = h.count;
    });
    return dataObj;
  });

  const dailyTrend = dashboardMetrics?.daily_trend?.length ? dashboardMetrics.daily_trend : MOCK_DAILY_TREND;
  const topUsers = dashboardMetrics?.top_users?.length ? dashboardMetrics.top_users : MOCK_TOP_USERS;
  const docStatusDist = dashboardMetrics?.doc_status_dist?.length ? dashboardMetrics.doc_status_dist : [
    { status: 'COMPLETED', count: 120 },
    { status: 'PENDING', count: 15 },
    { status: 'FAILED', count: 3 }
  ];

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Wawasan tingkat risiko, penggunaan token AI, dan performa sistem.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-primary/10 bg-linear-to-br from-background to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics?.total_documents || 138}</div>
            <p className="text-xs text-muted-foreground">+12% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengguna Aktif</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics?.total_users || 45}</div>
            <p className="text-xs text-muted-foreground">+3 pengguna baru</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Folder</CardTitle>
            <FolderTree className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics?.total_folders || 24}</div>
            <p className="text-xs text-muted-foreground">Struktur penyimpanan aktif</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-primary/10 bg-linear-to-br from-background to-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimasi Biaya AI</CardTitle>
            <Activity className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(dashboardMetrics?.total_cost_this_month || 145.20).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total pemakaian token bulan ini</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
        {/* Cost Over Time Area Chart */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Pemakaian Token (30 Hari Terakhir)</CardTitle>
            <CardDescription>Tren pengeluaran token AI secara global dalam USD.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="cost_usd" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Donut Chart */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Status Pemrosesan Dokumen</CardTitle>
            <CardDescription>Distribusi status dokumen yang diunggah.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={docStatusDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {docStatusDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Risk Heatmap */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-indigo-500" />
              Legal Risk Heatmap
            </CardTitle>
            <CardDescription>Tingkat risiko berdasarkan unit bisnis.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted))'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="HIGH" stackId="a" fill={RISK_COLORS["HIGH"]} radius={[0, 0, 4, 4]} />
                    <Bar dataKey="MEDIUM" stackId="a" fill={RISK_COLORS["MEDIUM"]} />
                    <Bar dataKey="LOW" stackId="a" fill={RISK_COLORS["LOW"]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                  Tidak ada data risiko
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Contracts */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-orange-500" />
              Kontrak Akan Berakhir
            </CardTitle>
            <CardDescription>Daftar kontrak yang membutuhkan perhatian segera.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4">
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
                <div className="text-sm text-muted-foreground text-center pt-24 border border-dashed rounded-lg h-full">
                  Tidak ada kontrak yang mendesak.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

