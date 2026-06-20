import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import { auth } from "@/auth";
import { LayoutHeader } from "@/features/dashboard/components/layout-header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        {/* Unified Dual Sidebar */}
        <AppSidebar session={session} />

        {/* Konten Utama (Kanan) */}
        <SidebarInset className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-zinc-900 min-w-0">
          <LayoutHeader />
          <div className="flex-1 overflow-auto p-4 md:p-6 relative">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
