"use client";

import { LogoIcon } from "@/features/dashboard/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/features/dashboard/components/nav-group";
import { navGroups } from "@/features/dashboard/components/app-shared";
import type { Session } from "next-auth";
import { NavUser } from "@/features/dashboard/components/nav-user";
import { usePathname } from "next/navigation";

export function AppSidebar({ session }: { session: Session | null }) {
  const role = session?.user?.role || "User";
  const pathname = usePathname();

  // Filter menu based on role and calculate active state
  const filteredGroups = navGroups
    .map((group) => {
      const filteredItems = group.items
        .filter((item) => {
          if (!item.roles) return true;
          return item.roles.includes(role);
        })
        .map((item) => {
          const isActive =
            pathname === item.path ||
            (!!item.path &&
              item.path !== "/dashboard" &&
              pathname.startsWith(item.path));
          const subItems = item.subItems?.map((sub) => ({
            ...sub,
            isActive: pathname === sub.path,
          }));

          return {
            ...item,
            isActive,
            subItems,
          };
        });
      return { ...group, items: filteredItems };
    })
    .filter((group) => group.items.length > 0);

  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="h-14 justify-center">
        <SidebarMenuButton asChild size="lg">
          <a href="/dashboard/chat" className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-2"}`}>
            <LogoIcon className="size-8 text-primary" />
            {!isCollapsed && (
              <span className="text-xl font-semibold tracking-tight">Telis</span>
            )}
          </a>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        {filteredGroups.map((group, index) => (
          <NavGroup key={`sidebar-group-${index}`} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser session={session} />
      </SidebarFooter>
    </Sidebar>
  );
}
