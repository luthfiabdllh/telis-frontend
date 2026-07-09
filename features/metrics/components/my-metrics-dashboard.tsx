"use client";

import { useState } from "react";
import { useMyMetrics } from "../hooks/use-metrics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, AlertTriangle, MessageSquare, Zap, Clock, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatDistanceToNow, parseISO, subDays, format } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

const CHART_COLORS = [
  "var(--primary)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

export function MyMetricsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const queryParams = {
    start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  };

  const { data, isLoading, isError } = useMyMetrics(queryParams);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card className="col-span-1 shadow-sm border-border/50 rounded-2xl h-[160px] backdrop-blur-sm bg-card/80">
            <CardHeader className="pb-2"><Skeleton className="h-4 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-24 mb-2" /><Skeleton className="h-3 w-40" /></CardContent>
          </Card>
          <Card className="col-span-1 shadow-sm border-border/50 rounded-2xl h-[160px] backdrop-blur-sm bg-card/80">
            <CardHeader className="pb-2"><Skeleton className="h-4 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-10 w-24 mb-2" /><Skeleton className="h-3 w-40" /></CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/50 rounded-2xl h-[420px] backdrop-blur-sm bg-card/80 flex flex-col">
            <CardHeader><Skeleton className="h-6 w-48 mb-2" /><Skeleton className="h-4 w-64" /></CardHeader>
            <CardContent className="flex-1"><Skeleton className="h-full w-full rounded-xl" /></CardContent>
          </Card>
          <Card className="col-span-1 shadow-sm border-border/50 rounded-2xl h-[420px] backdrop-blur-sm bg-card/80 flex flex-col">
            <CardHeader><Skeleton className="h-6 w-40 mb-2" /><Skeleton className="h-4 w-48" /></CardHeader>
            <CardContent className="flex-1"><Skeleton className="h-[250px] w-[250px] rounded-full mx-auto" /></CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          <Card className="shadow-sm border-border/50 rounded-2xl h-[400px] backdrop-blur-sm bg-card/80">
            <CardHeader><Skeleton className="h-6 w-40 mb-2" /><Skeleton className="h-4 w-64" /></CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </CardContent>
          </Card>
        </div>
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
  
  const featureDist = data.feature_usage_dist || [];

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        show: { transition: { staggerChildren: 0.1 } },
      }}
      className="space-y-6"
    >
      {/* Quota Alert */}
      {budgetPercentage >= 80 && (
        <motion.div variants={itemVariant}>
          <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 shadow-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Peringatan Kuota Anggaran</AlertTitle>
            <AlertDescription>
              Anda telah menghabiskan {budgetPercentage.toFixed(1)}% dari anggaran bulanan Anda. Pemakaian fitur AI mungkin akan dibatasi jika kuota habis.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div variants={itemVariant} className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Budget Card */}
        <Card className="col-span-1 shadow-sm border-border/50 rounded-2xl h-full backdrop-blur-sm bg-card/80 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pemakaian Saya
            </CardTitle>
            <div className="p-2 rounded-xl bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
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
        <Card className="shadow-sm border-border/50 rounded-2xl h-full backdrop-blur-sm bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sisa Anggaran</CardTitle>
            <div className="p-2 rounded-xl bg-chart-2/10">
              <Zap className="h-4 w-4 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-chart-2">
              ${Math.max(budgetLimit - currentCost, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Sisa kuota token bulan ini</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariant} className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {/* Personal Usage Trend */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/50 rounded-2xl h-full backdrop-blur-sm bg-card/80 flex flex-col">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
            <div className="space-y-1.5">
              <CardTitle>Tren Penggunaan Pribadi</CardTitle>
              <CardDescription>Konsumsi token AI harian Anda (USD).</CardDescription>
            </div>
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-[300px] w-full min-h-[300px]">
              {dailyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPersonalCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Area type="monotone" dataKey="cost_usd" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorPersonalCost)" />
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

        {/* Feature Usage Donut */}
        <Card className="col-span-1 shadow-sm border-border/50 rounded-2xl h-full backdrop-blur-sm bg-card/80 flex flex-col">
          <CardHeader>
            <CardTitle>Distribusi Fitur</CardTitle>
            <CardDescription>Pemakaian anggaran per fitur.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center pb-6">
            {featureDist.length > 0 ? (
              <>
                <div className="h-[250px] w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={featureDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="cost_usd"
                        nameKey="feature"
                        stroke="none"
                      >
                        {featureDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 mt-4 px-2">
                  {featureDist.map((feat, idx) => (
                    <div key={feat.feature} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                        <span className="font-medium">{feat.feature}</span>
                      </div>
                      <span className="text-muted-foreground">${feat.cost_usd.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-muted/20 min-h-[250px]">
                Belum ada data distribusi fitur.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariant} className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        {/* Recent Activity */}
        <Card className="col-span-1 shadow-sm border-border/50 rounded-2xl h-full backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle>Aktivitas Terakhir</CardTitle>
            <CardDescription>Log permintaan AI terakhir Anda beserta detail token.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl bg-background/50 transition-colors hover:bg-muted/50">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-2 rounded-xl ${activity.type === 'Chat' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        {activity.type === 'Chat' ? <MessageSquare className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none" title={activity.title}>{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true, locale: id })}</p>
                      </div>
                    </div>
                    <div className="flex items-center sm:justify-end gap-3 text-right">
                      <div className="flex flex-col items-end mr-4">
                        <p className="text-sm font-medium text-destructive">-${activity.cost.toFixed(4)}</p>
                        <p className="text-xs text-muted-foreground">{activity.tokens} Total</p>
                      </div>
                      
                      {/* Input/Output Token Split Badge */}
                      {(activity.input_tokens !== undefined || activity.output_tokens !== undefined) && (
                        <div className="flex gap-2">
                          {activity.input_tokens !== undefined && (
                            <div className="px-2 py-1 bg-muted rounded-md text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                              {activity.input_tokens} In
                            </div>
                          )}
                          {activity.output_tokens !== undefined && (
                            <div className="px-2 py-1 bg-primary/10 rounded-md text-[10px] font-medium text-primary whitespace-nowrap">
                              {activity.output_tokens} Out
                            </div>
                          )}
                        </div>
                      )}
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
      </motion.div>
    </motion.div>
  );
}
