"use client";

import * as React from "react";
import {
  Archive,
  Flag,
  Scale,
  Home,
  FileText,
  ShieldCheck,
  BarChart3,
  PieChart,
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
import Link from "next/link";

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
                    <Link href="/dashboard">
                      <Home className="h-4 w-4" />
                      <span>Beranda</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Obrolan AI">
                    <Link href="/dashboard/chat">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Obrolan AI</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Repositori Dokumen">
                    <Link href="/dashboard/documents">
                      <Archive className="h-4 w-4" />
                      <span>Repositori Dokumen</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Analisis Redline">
                    <Link href="/dashboard/redline">
                      <FileText className="h-4 w-4" />
                      <span>Analisis Redline</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Statistik Token Saya">
                    <Link href="/dashboard/metrics">
                      <BarChart3 className="h-4 w-4" />
                      <span>Statistik Token Saya</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dashboard Analytics">
                    <Link href="/dashboard/analytics">
                      <PieChart className="h-4 w-4" />
                      <span>Dashboard Analytics</span>
                    </Link>
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
                      <Link href="/dashboard/admin/users">
                        <Flag className="h-4 w-4" />
                        <span>Pengelolaan Pengguna</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {session?.user?.role === "Admin" && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Laporan Pemakaian">
                        <Link href="/dashboard/admin/metrics">
                          <BarChart3 className="h-4 w-4" />
                          <span>Laporan Pemakaian</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
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
