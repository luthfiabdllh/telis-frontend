"use client";

import { useDashboardMetrics } from "../hooks/use-metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, AlertTriangle, Users, FileText, FolderOpen } from "lucide-react";

const ANOMALY_THRESHOLD = 5.00;

export function MetricsDashboard() {
  const { data, isLoading, isError } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center text-destructive border rounded-xl bg-destructive/10">
        <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Gagal memuat data metrik</h3>
        <p>Pastikan Anda memiliki wewenang Admin untuk melihat halaman ini.</p>
      </div>
    );
  }

  // Format chart config
  const chartConfig = {
    cost: {
      label: "Biaya (USD)",
      color: "hsl(var(--primary))",
    },
    tokens: {
      label: "Total Token",
      color: "hsl(var(--muted-foreground))",
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-8">
      {/* Summary Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Biaya LLM</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ${data.total_cost_this_month.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.total_users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.total_documents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Direktori</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.total_folders}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {/* Chart Section */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tren Pemakaian Harian</CardTitle>
            <CardDescription>
              Biaya LLM harian selama bulan ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!data.daily_trend || data.daily_trend.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Belum ada data pemakaian bulan ini.
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.daily_trend} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => {
                          const d = new Date(value);
                          return `${d.getDate()}/${d.getMonth() + 1}`;
                        }}
                        className="text-xs"
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `$${value}`}
                        className="text-xs"
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="cost_usd" fill="var(--color-cost)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Users Section */}
        <Card className="col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Pengguna Teratas (Top Users)</CardTitle>
            <CardDescription>
              5 Pengguna dengan pemakaian token tertinggi.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {!data.top_users || data.top_users.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Belum ada pengguna yang tercatat menggunakan AI.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Pengguna</TableHead>
                    <TableHead className="text-right">Biaya (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.top_users.map((user) => {
                    const isAnomaly = user.total_cost >= ANOMALY_THRESHOLD;
                    return (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <div className="font-medium">{user.name || user.email}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                          {isAnomaly && (
                            <Badge variant="destructive" className="mt-1 text-[10px] px-1 py-0 shadow-sm">
                              <AlertTriangle className="w-3 h-3 mr-1 inline-block" /> High Usage
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${isAnomaly ? 'text-destructive' : ''}`}>
                          ${user.total_cost.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {/* Pie Chart: Document Status */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribusi Status Dokumen</CardTitle>
            <CardDescription>Komposisi dokumen berdasarkan status ingestion.</CardDescription>
          </CardHeader>
          <CardContent>
            {!data.doc_status_dist || data.doc_status_dist.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">Belum ada dokumen.</div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.doc_status_dist}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="status"
                      label={({ name, value }) => `${name} (${value})`}
                    >
                      {data.doc_status_dist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart: User Roles */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Demografi Wewenang Pengguna</CardTitle>
            <CardDescription>Sebaran peran (role) pengguna dalam sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            {!data.user_role_dist || data.user_role_dist.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">Belum ada pengguna.</div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.user_role_dist}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#82ca9d"
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="role"
                      label={({ name, value }) => `${name} (${value})`}
                    >
                      {data.user_role_dist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
