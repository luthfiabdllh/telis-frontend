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
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
                  <ChatItem 
                    key={chat.id} 
                    chat={chat} 
                    session={session} 
                    selectedSessionId={selectedSessionId} 
                    setSelectedSessionId={setSelectedSessionId} 
                    pathname={pathname} 
                  />
                ))
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}

function ChatItem({ chat, session, selectedSessionId, setSelectedSessionId, pathname }: any) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(chat.title);
  const queryClient = useQueryClient();

  const handleRename = async (e: React.KeyboardEvent | React.FocusEvent) => {
    if (e.type === "keydown" && (e as React.KeyboardEvent).key !== "Enter") return;
    
    setIsEditing(false);
    if (title.trim() === "" || title === chat.title) {
      setTitle(chat.title);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/chat/sessions/${chat.id}/title`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ title: title.trim() }),
      });
      
      if (!res.ok) throw new Error("Failed to rename chat");
      
      // Update cache
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    } catch (error) {
      console.error(error);
      setTitle(chat.title); // revert on error
    }
  };

  return (
    <div
      className={`group relative flex w-full flex-col items-start gap-2 border-b p-4 text-sm leading-tight text-left transition-colors cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${selectedSessionId === chat.id || pathname === "/dashboard/chat/" + chat.id ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}`}
    >
      <div className="flex w-full items-center justify-between gap-2">
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleRename}
            onBlur={handleRename}
            className="w-full bg-background/50 border px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span 
            className="truncate font-semibold flex-1"
            onClick={() => {
              setSelectedSessionId(chat.id);
              window.location.href = `/dashboard/chat/${chat.id}`;
            }}
          >
            {title}
          </span>
        )}
        {!isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-opacity"
            title="Ubah Judul"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
          </button>
        )}
      </div>
      <span 
        className="text-xs text-muted-foreground line-clamp-1 w-full whitespace-break-spaces"
        onClick={() => {
          setSelectedSessionId(chat.id);
          window.location.href = `/dashboard/chat/${chat.id}`;
        }}
      >
        {formatDistanceToNow(new Date(chat.updated_at), {
          addSuffix: true,
          locale: id,
        })}
      </span>
    </div>
  );
}
