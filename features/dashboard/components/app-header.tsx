"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/features/dashboard/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/features/dashboard/components/custom-sidebar-trigger";
import { navLinks } from "@/features/dashboard/components/app-shared";
import { NavUser } from "@/features/dashboard/components/nav-user";
import { BellIcon } from "lucide-react";
import type { Session } from "next-auth";
import { usePathname } from "next/navigation";

export function AppHeader({ session }: { session: Session | null }) {
    const pathname = usePathname();
    const activeItem = navLinks.find((item) => item.path === pathname) || navLinks[0];

	return (
		<header
			className={cn(
				"p-4 flex items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800"
			)}
		>
			<div className="flex items-center gap-3">
				<CustomSidebarTrigger />
				<Separator
					className="mr-2 h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<AppBreadcrumbs page={activeItem} />
			</div>
			<div className="flex items-center gap-3">
				<Button aria-label="Notifications" size="icon" variant="ghost">
					<BellIcon />
				</Button>
				<Separator
					className="h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<NavUser session={session} />
			</div>
		</header>
	);
}
