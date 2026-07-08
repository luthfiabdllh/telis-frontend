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
import { usePathname, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { DriveSearch } from "@/features/documents/components/drive-search";

export function AppHeader({ session }: { session: Session | null }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeItem = navLinks.find((item) => item.path === pathname) || navLinks[0];
    
    const folderIdParam = searchParams?.get("folder_id");
    const currentFolderId = folderIdParam === "null" ? null : folderIdParam;
    const isDocumentsPage = pathname?.startsWith("/dashboard/documents");
    
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

	return (
		<header
			className={cn(
				"p-4 flex items-center justify-between gap-2 border-b border-sidebar-border"
			)}
		>
			<div className="flex items-center gap-3">
				<CustomSidebarTrigger />
				<Separator
					className="mr-2 h-4 data-[orientation=vertical]:self-center hidden md:block"
					orientation="vertical"
				/>
				{!isDocumentsPage && (
				  <div className="hidden md:block">
				    <AppBreadcrumbs page={activeItem} />
				  </div>
				)}
			</div>
            
            {isDocumentsPage && (
                <div className="flex-1 flex justify-center w-full max-w-2xl px-2">
                    <DriveSearch currentFolderId={currentFolderId} />
                </div>
            )}
            
			<div className="flex items-center gap-3 ml-auto">
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
