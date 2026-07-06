"use client";

import { useEffect, useState } from "react";
import { Scale } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenuButton,
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
    const filteredGroups = navGroups.map(group => {
        const filteredItems = group.items.filter(item => {
            if (!item.roles) return true;
            return item.roles.includes(role);
        }).map(item => {
            const isActive = pathname === item.path || (!!item.path && item.path !== "/dashboard" && pathname.startsWith(item.path));
            const subItems = item.subItems?.map(sub => ({
                ...sub,
                isActive: pathname === sub.path
            }));
            
            return {
                ...item,
                isActive,
                subItems
            };
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
				<NavUser session={session} />
			</SidebarFooter>
		</Sidebar>
	);
}
