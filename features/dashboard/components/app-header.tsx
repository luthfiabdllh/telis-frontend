"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/features/dashboard/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/features/dashboard/components/custom-sidebar-trigger";
import { navLinks } from "@/features/dashboard/components/app-shared";
import { BellIcon, Moon, Sun } from "lucide-react";
import type { Session } from "next-auth";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export function AppHeader({ session }: { session: Session | null }) {
    const pathname = usePathname();
    const activeItem = navLinks.find((item) => item.path === pathname) || navLinks[0];
    
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
				<Button 
                    aria-label="Toggle Theme" 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {mounted ? (
                        theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />
                    ) : (
                        <Moon className="size-4" />
                    )}
                </Button>
			</div>
		</header>
	);
}
