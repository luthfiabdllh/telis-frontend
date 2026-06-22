"use client";

import * as React from "react";
import {
  Archive,
  Flag,
  Scale,
  Home,
  FileText,
  ShieldCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Session } from "next-auth";
import { NavUser } from "./nav-user";
import { ChatHistorySidebar } from "./chat-history-sidebar";

export function AppSidebar({ session }: { session: Session | null }) {
  return (
    <div className="flex h-full">
      {/* First sidebar (App Nav) */}
      <Sidebar
        style={{ "--sidebar-width": "16rem" } as React.CSSProperties}
        collapsible="icon"
        className="border-r p-2 px-1 shrink-0 bg-sidebar"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-12 md:p-2">
                <a href="#">
                  <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Scale className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">TELIS</span>
                    <span className="truncate text-xs">Digistar 2024</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Beranda">
                    <a href="/dashboard">
                      <Home className="h-4 w-4" />
                      <span>Beranda</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Obrolan AI">
                    <a href="/dashboard/chat">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Obrolan AI</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Repositori Dokumen">
                    <a href="/dashboard/documents">
                      <Archive className="h-4 w-4" />
                      <span>Repositori Dokumen</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Analisis Redline">
                    <a href="/dashboard/redline">
                      <FileText className="h-4 w-4" />
                      <span>Analisis Redline</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {(session?.user?.role === "Admin" || session?.user?.role === "Legal") && (
            <SidebarGroup>
              <SidebarGroupLabel>Administrator</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Pengelolaan Pengguna">
                      <a href="/dashboard/admin/users">
                        <Flag className="h-4 w-4" />
                        <span>Pengelolaan Pengguna</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Laporan Pemakaian">
                      <a href="/dashboard/admin/reports">
                        <FileText className="h-4 w-4" />
                        <span>Laporan Pemakaian</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            user={{
              name: session?.user?.name || "User",
              email: session?.user?.email || "",
              avatar: session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "User")}&background=random&color=fff`,
            }}
          />
        </SidebarFooter>
      </Sidebar>

      <ChatHistorySidebar session={session} />
    </div>
  );
}
