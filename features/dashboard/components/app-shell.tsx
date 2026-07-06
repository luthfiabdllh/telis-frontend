import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/features/dashboard/components/app-header";
import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import type { Session } from "next-auth";

export function AppShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <SidebarInset className="flex-1 overflow-hidden flex flex-col min-w-0">
        <AppHeader session={session} />
        <div className="flex-1 overflow-auto p-4 md:p-6 relative">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
