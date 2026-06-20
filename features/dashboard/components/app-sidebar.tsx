"use client";

import * as React from "react";
import {
  Archive,
  Flag,
  Scale,
  Home,
  FileText,
  ShieldCheck,
  MessageSquare,
  X,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Session } from "next-auth";
import { useChatStore } from "@/features/chat/store/use-chat-store";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { NavUser } from "./nav-user";
import { cn } from "@/lib/utils";

import { usePathname } from "next/navigation";

export function AppSidebar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const isChatRoute = pathname?.startsWith("/dashboard/chat");
  const {
    chatSessions,
    setChatSessions,
    selectedSessionId,
    setSelectedSessionId,
    isChatHistoryOpen,
  } = useChatStore();
  const [query, setQuery] = React.useState("");
  const { setOpen } = useSidebar();
  const [isLoading, setIsLoading] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    async function fetchSessions() {
      if (!session?.accessToken) return;
      try {
        setIsLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/chat/sessions`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setChatSessions(data || []);
        }
      } catch (error) {
        console.error("Failed to fetch chat sessions:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSessions();
  }, [session, setChatSessions]);

  const filteredSessions = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chatSessions;
    return chatSessions.filter((c) => c.title.toLowerCase().includes(q));
  }, [chatSessions, query]);

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
                  <div className="bg-sidebar-accent text-sidebar-accent-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Scale className="size-5" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                    <span className="truncate font-bold tracking-tight">
                      TELIS
                    </span>
                    <span className="truncate text-xs">AI Legal Assistant</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {[
                  { title: "Dashboard", url: "/dashboard/chat", icon: Home },
                  {
                    title: "Dokumen Hukum",
                    url: "/dashboard/dokumen-hukum",
                    icon: FileText,
                  },
                  ...(session?.user?.role === "Admin"
                    ? [{ title: "Panel Admin", url: "#", icon: ShieldCheck }]
                    : []),
                ].map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.url}
                      className="px-2.5 md:px-2"
                    >
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
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

      {/* Second sidebar (Chat History) */}
      {isChatRoute && (
        <div
          className={cn(
            "transition-all duration-300 ease-in-out h-full overflow-hidden shrink-0 border-r",
            "absolute md:relative z-40 left-0 md:left-auto top-0 md:top-auto bg-sidebar shadow-2xl md:shadow-none",
            (!mounted || isChatHistoryOpen) ? "w-[85vw] sm:w-80 opacity-100" : "w-0 opacity-0 border-none",
          )}
        >
          <Sidebar
            collapsible="none"
            className="flex-1 w-full h-full bg-sidebar border-none"
          >
            <SidebarHeader className="gap-3.5 border-b p-4">
              <div className="flex w-full items-center justify-between">
                <div className="text-foreground text-base font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Riwayat Obrolan
                </div>
                <button
                  onClick={() =>
                    useChatStore.getState().setChatHistoryOpen(false)
                  }
                  className="md:hidden p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarInput
                placeholder="Cari obrolan..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-8"
              />
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup className="px-0 pt-0">
              <SidebarGroupContent>
                {!mounted ? (
                  <div className="p-4" suppressHydrationWarning />
                ) : isLoading ? (
                  <div className="flex flex-col gap-2 p-4">
                    <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                    <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                    <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                  </div>
                ) : filteredSessions.length === 0 ? (
                    <div className="text-muted-foreground p-4 text-sm text-center mt-4">
                      Belum ada obrolan
                    </div>
                  ) : (
                    filteredSessions.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => setSelectedSessionId(chat.id)}
                        className={`hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full flex-col items-start gap-2 border-b p-4 text-sm leading-tight text-left transition-colors ${selectedSessionId === chat.id ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}`}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="truncate font-semibold">
                            {chat.title}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-1 w-full whitespace-break-spaces">
                          {formatDistanceToNow(new Date(chat.updated_at), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </span>
                      </button>
                    ))
                  )}
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </div>
      )}
    </div>
  );
}
