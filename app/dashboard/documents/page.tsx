import { Suspense } from "react";
import { DriveContainer } from "@/features/documents/components/drive-container";
import { Spinner } from "@/components/ui/spinner";

export default function DokumenHukumPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <Suspense fallback={<div className="flex items-center justify-center h-full"><Spinner /></div>}>
        <DriveContainer />
      </Suspense>
    </div>
  );
}
