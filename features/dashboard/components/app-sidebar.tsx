"use client";

import { Scale } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/features/dashboard/components/nav-group";
import { navGroups } from "@/features/dashboard/components/app-shared";
import type { Session } from "next-auth";

export function AppSidebar({ session }: { session: Session | null }) {
    const role = session?.user?.role || "User";

    // Filter menu based on role
    const filteredGroups = navGroups.map(group => {
        const filteredItems = group.items.filter(item => {
            if (!item.roles) return true;
            return item.roles.includes(role);
        });
        return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);

	return (
		<Sidebar collapsible="icon" variant="floating">
			<SidebarHeader className="h-14 justify-center">
				<SidebarMenuButton asChild>
					<a href="/dashboard">
						<div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                            <Scale className="size-4" />
                        </div>
						<span className="font-medium text-lg tracking-tight">TELIS</span>
					</a>
				</SidebarMenuButton>
			</SidebarHeader>
			<SidebarContent>
				{filteredGroups.map((group, index) => (
					<NavGroup key={`sidebar-group-${index}`} {...group} />
				))}
			</SidebarContent>
			<SidebarFooter>
				{/* LatestChange and footerNavLinks removed for cleaner layout */}
			</SidebarFooter>
		</Sidebar>
	);
}
