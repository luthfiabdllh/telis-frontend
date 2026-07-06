import { auth } from "@/auth";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { GlobalUploadProgress } from "@/features/documents/components/global-upload-progress";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 relative">
      <AppShell session={session}>
        {children}
      </AppShell>
      <GlobalUploadProgress />
    </div>
  );
}
