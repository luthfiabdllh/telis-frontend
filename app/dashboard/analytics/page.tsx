import { Metadata } from "next";
import { AnalyticsDashboardContainer } from "@/features/metrics/components/analytics-dashboard-container";
import { Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Analytics - TELIS",
  description:
    "Wawasan tingkat risiko, penggunaan token AI, dan performa sistem.",
};

export default function AnalyticsDashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 w-full max-w-full overflow-x-hidden">
      <div className="flex-1 flex-col space-y-8 flex w-full">
        <AnalyticsDashboardContainer />
      </div>
    </div>
  );
}
