import { Metadata } from "next";
import { MyMetricsDashboard } from "@/features/metrics/components/my-metrics-dashboard";

export const metadata: Metadata = {
  title: "Statistik Token Saya - TELIS",
  description: "Pantau penggunaan token AI Anda.",
};

export default function MyMetricsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Statistik Token Saya</h2>
          <p className="text-muted-foreground mt-1">Lacak penggunaan dan anggaran AI Anda.</p>
        </div>
      </div>
      <div className="h-full flex-1 flex-col space-y-8">
        <MyMetricsDashboard />
      </div>
    </div>
  );
}
