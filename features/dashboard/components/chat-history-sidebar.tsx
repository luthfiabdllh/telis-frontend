"use client";

import * as React from "react";
import { MessageSquare, X, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
} from "@/components/ui/sidebar";
import { Session } from "next-auth";
import { useChatStore, type ChatSession } from "@/features/chat/store/use-chat-store";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export function ChatHistorySidebar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const isChatRoute = pathname?.startsWith("/dashboard/chat");
  const {
    selectedSessionId,
    setSelectedSessionId,
    isChatHistoryOpen,
  } = useChatStore();
  
  const [query, setQuery] = React.useState("");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: chatSessions = [], isLoading } = useQuery({
    queryKey: ["chat-sessions"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/chat/sessions`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch chat sessions");
      return res.json();
    },
    enabled: !!session?.accessToken,
  });

  const filteredSessions = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chatSessions;
    return chatSessions.filter((c: any) => c.title.toLowerCase().includes(q));
  }, [chatSessions, query]);

  if (!isChatRoute) return null;

  return (
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
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setSelectedSessionId(null);
                  window.location.href = "/dashboard/chat";
                }}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                title="Obrolan Baru"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  useChatStore.getState().setChatHistoryOpen(false)
                }
                className="md:hidden p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
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
                filteredSessions.map((chat: ChatSession) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setSelectedSessionId(chat.id);
                      window.location.href = `/dashboard/chat/${chat.id}`;
                    }}
                    className={`hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full flex-col items-start gap-2 border-b p-4 text-sm leading-tight text-left transition-colors ${selectedSessionId === chat.id || pathname === `/dashboard/chat/${chat.id}` ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}`}
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
  );
}
