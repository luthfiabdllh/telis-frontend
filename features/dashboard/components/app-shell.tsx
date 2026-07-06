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
      <AppSidebar session={session}/>
      <SidebarInset className="flex-1 overflow-hidden flex flex-col min-w-0 bg-sidebar backdrop-blur-xl md:my-2 md:mr-2 md:rounded-xl md:shadow-sm md:ring-1 md:ring-sidebar-border">
        <AppHeader session={session} />
        <div className="flex-1 overflow-auto p-4 md:p-6 relative">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
