import { auth } from "@/auth";
import { AppShell } from "@/features/dashboard/components/app-shell";
import { GlobalUploadProgress } from "@/features/documents/components/global-upload-progress";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#e8e9ed] dark:bg-[#131313] relative">
      <AppShell session={session}>{children}</AppShell>
      <GlobalUploadProgress />
    </div>
  );
}
