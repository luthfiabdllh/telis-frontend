import { Metadata } from "next";
import { MetricsDashboard } from "@/features/metrics/components/metrics-dashboard";

export const metadata: Metadata = {
  title: "Laporan Pemakaian - TELIS",
  description: "Pantau penggunaan token AI dan estimasi biaya bulanan.",
};

export default function MetricsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Laporan Pemakaian</h2>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <MetricsDashboard />
      </div>
    </div>
  );
}
