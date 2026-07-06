"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from "@/components/ui/sidebar";
import { UserIcon, BellIcon, CommandIcon, LifeBuoyIcon, ChevronsUpDown, LogOutIcon } from "lucide-react";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";

export function NavUser({ session }: { session: Session | null }) {
    const { isMobile } = useSidebar();
    
    const user = {
        name: session?.user?.name || "User",
        email: session?.user?.email || "",
        avatar: session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "User")}&background=random&color=fff`,
    };

	return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="size-8 rounded-lg">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold text-foreground">{user.name}</span>
                                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        align="end" 
                        side={isMobile ? "bottom" : "right"} 
                        sideOffset={4} 
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    >
                        <DropdownMenuItem className="flex items-center justify-start gap-2">
                            <DropdownMenuLabel className="flex items-center gap-3">
                                <Avatar className="size-10 rounded-lg">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <span className="font-medium text-foreground">{user.name}</span>{" "}
                                    <br />
                                    <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground text-xs">
                                        {user.email}
                                    </div>
                                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                                        {session?.user?.role || "User"}
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <UserIcon />
                                Profile
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <BellIcon />
                                Notifications
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CommandIcon />
                                Keyboard shortcuts
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <LifeBuoyIcon />
                                Help
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                className="w-full cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                                onClick={() => signOut({ callbackUrl: "/login" })}
                            >
                                <LogOutIcon />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
	);
}
