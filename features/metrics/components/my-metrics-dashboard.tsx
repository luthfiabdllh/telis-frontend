"use client";

import { useMyMetrics } from "../hooks/use-metrics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, AlertTriangle, MessageSquare, Zap, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatDistanceToNow, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export function MyMetricsDashboard() {
  const { data, isLoading, isError } = useMyMetrics();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[120px] w-full max-w-md" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-destructive border rounded-xl bg-destructive/10 max-w-md">
        <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Gagal memuat data metrik</h3>
      </div>
    );
  }

  const budgetLimit = 50.00; // Contoh limit $50
  const currentCost = data.total_cost_this_month || 0;
  const budgetPercentage = Math.min((currentCost / budgetLimit) * 100, 100);

  const dailyTrend = data.daily_trend || [];
  const recentActivities = data.recent_activities || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Budget Card */}
        <Card className="col-span-1 border-primary/20 shadow-sm bg-linear-to-br from-background to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pemakaian Saya
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              ${currentCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2 mb-4">
              Dari batas anggaran bulanan ${budgetLimit.toFixed(2)}
            </p>
            {/* Progress bar */}
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full ${budgetPercentage > 80 ? 'bg-destructive' : 'bg-primary'}`} 
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-right mt-1 text-muted-foreground">
              {budgetPercentage.toFixed(1)}% terpakai
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sisa Anggaran</CardTitle>
            <Zap className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${Math.max(budgetLimit - currentCost, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sisa kuota token bulan ini</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Personal Usage Trend */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Tren Penggunaan Pribadi</CardTitle>
            <CardDescription>Konsumsi token AI harian Anda (USD).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {dailyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPersonalCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area type="monotone" dataKey="cost_usd" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorPersonalCost)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                  Belum ada penggunaan tercatat.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Aktivitas Terakhir</CardTitle>
            <CardDescription>Log permintaan AI terakhir Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mt-2">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-2 rounded-md ${activity.type === 'Chat' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        {activity.type === 'Chat' ? <MessageSquare className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none line-clamp-1" title={activity.title}>{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true, locale: id })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-destructive">-${activity.cost.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">{activity.tokens} tkns</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-center text-muted-foreground py-8">
                  Tidak ada aktivitas baru-baru ini.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
