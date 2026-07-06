"use client";

import * as React from "react";
import { MessageSquare, X, Plus, Sparkles, Search, MoreHorizontal, Pencil, Trash, ChevronDown } from "lucide-react";
import { Session } from "next-auth";
import { useChatStore, type ChatSession } from "@/features/chat/store/use-chat-store";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { isToday, isYesterday, subDays, isAfter, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

export function ChatHistorySidebar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const isChatRoute = pathname?.startsWith("/dashboard/chat");
  const {
    selectedSessionId,
    setSelectedSessionId,
    isChatHistoryOpen,
    setChatHistoryOpen,
  } = useChatStore();
  
  const [query, setQuery] = React.useState("");
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["chat-sessions", query],
    queryFn: async ({ pageParam = 1 }) => {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/chat/sessions`);
      url.searchParams.set("page", pageParam.toString());
      url.searchParams.set("limit", "20");
      if (query) {
        url.searchParams.set("search", query);
      }
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch chat sessions");
      return res.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      // Assuming API returns array or { data: [], hasNextPage: boolean, nextCursor: number }
      // If it just returns array, we check length
      if (Array.isArray(lastPage)) {
        return lastPage.length === 20 ? allPages.length + 1 : undefined;
      }
      return lastPage.hasNextPage ? lastPage.nextCursor : undefined;
    },
    initialPageParam: 1,
    enabled: !!session?.accessToken,
  });

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle click outside to close search
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isSearchExpanded && searchInputRef.current && !searchInputRef.current.contains(e.target as Node) && query === "") {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchExpanded, query]);

  if (!isChatRoute) return null;

  // Flatten the infinite query data
  const flatSessions = React.useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => (Array.isArray(page) ? page : page.data || []));
  }, [data]);

  // Grouping logic
  const groupedSessions = React.useMemo(() => {
    const groups: { [key: string]: ChatSession[] } = {
      "Today": [],
      "Yesterday": [],
      "Previous 7 Days": [],
      "Older": [],
    };

    const sevenDaysAgo = subDays(new Date(), 7);

    flatSessions.forEach((chat) => {
      const chatDate = new Date(chat.updated_at);
      if (isToday(chatDate)) {
        groups["Today"].push(chat);
      } else if (isYesterday(chatDate)) {
        groups["Yesterday"].push(chat);
      } else if (isAfter(chatDate, sevenDaysAgo)) {
        groups["Previous 7 Days"].push(chat);
      } else {
        groups["Older"].push(chat);
      }
    });

    return groups;
  }, [flatSessions]);

  return (
    <aside
      className={cn(
        "transition-all duration-300 ease-in-out h-full overflow-hidden shrink-0 bg-sidebar text-sidebar-foreground",
        "absolute md:relative z-40 left-0 md:left-auto top-0 md:top-auto shadow-xl md:shadow-none border-r border-sidebar-border",
        (!mounted || isChatHistoryOpen) ? "w-[85vw] sm:w-80 opacity-100" : "w-0 opacity-0 border-none",
      )}
    >
      <div className="flex flex-col h-full w-[85vw] sm:w-80 px-4 py-4">
        
        {/* Header with animated search */}
        <div className="flex items-center justify-between h-10 mb-6 relative">
          {!isSearchExpanded ? (
            <>
              <h2 className="text-xl font-semibold">Chat History</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className="p-2 hover:bg-sidebar-accent rounded-full transition-colors text-muted-foreground"
                >
                  <Search className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setChatHistoryOpen(false)}
                  className="md:hidden p-2 hover:bg-sidebar-accent rounded-full transition-colors text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : (
            <div ref={searchInputRef} className="flex items-center w-full relative animate-in fade-in slide-in-from-right-4 duration-200">
              <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
              <input
                autoFocus
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 w-full pl-9 pr-8 bg-transparent outline-none border-b border-sidebar-border focus:border-sidebar-ring text-sm"
              />
              <button
                onClick={() => {
                  setIsSearchExpanded(false);
                  setQuery("");
                }}
                className="absolute right-2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => {
            setSelectedSessionId(null);
            window.location.href = "/dashboard/chat";
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0a0a0a] dark:bg-primary py-3 text-sm font-medium text-white dark:text-primary-foreground shadow-md transition-all hover:opacity-90 mb-6"
        >
          <Plus className="h-4 w-4" />
          New Chat
          <Sparkles className="h-4 w-4 ml-1" />
        </button>

        {/* History List */}
        <div className="flex-1 overflow-y-auto no-scrollbar -mx-2 px-2">
          {!mounted ? (
            <div className="p-4" suppressHydrationWarning />
          ) : isLoading && flatSessions.length === 0 ? (
            <div className="flex flex-col gap-2 p-2">
              <div className="h-10 bg-sidebar-accent rounded-lg animate-pulse" />
              <div className="h-10 bg-sidebar-accent rounded-lg animate-pulse" />
              <div className="h-10 bg-sidebar-accent rounded-lg animate-pulse" />
            </div>
          ) : flatSessions.length === 0 ? (
            <div className="text-sidebar-foreground/70 p-4 text-sm text-center mt-4">
              {query ? "No chats found" : "No chats yet"}
            </div>
          ) : (
            <div className="flex flex-col pb-4">
              {Object.entries(groupedSessions).map(([groupName, chats]) => (
                <ChatGroup
                  key={groupName}
                  groupName={groupName}
                  chats={chats}
                  session={session}
                  selectedSessionId={selectedSessionId}
                  setSelectedSessionId={setSelectedSessionId}
                  pathname={pathname}
                />
              ))}
              
              {/* Intersection Observer target */}
              <div ref={ref} className="h-4 mt-2">
                {isFetchingNextPage && (
                  <div className="w-full flex justify-center">
                    <div className="h-1.5 w-1.5 bg-sidebar-ring rounded-full animate-ping" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function ChatGroup({ groupName, chats, session, selectedSessionId, setSelectedSessionId, pathname }: any) {
  const [isOpen, setIsOpen] = React.useState(true);
  
  if (chats.length === 0) return null;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mb-4 last:mb-0"
    >
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between gap-2 mb-2 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors outline-none">
          <span>{groupName}</span>
          <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", !isOpen && "-rotate-90")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {chats.map((chat: any) => (
          <ChatItem 
            key={chat.id} 
            chat={chat} 
            session={session} 
            selectedSessionId={selectedSessionId} 
            setSelectedSessionId={setSelectedSessionId} 
            pathname={pathname} 
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function ChatItem({ chat, session, selectedSessionId, setSelectedSessionId, pathname }: any) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(chat.title);
  const queryClient = useQueryClient();
  const isActive = selectedSessionId === chat.id || pathname === "/dashboard/chat/" + chat.id;

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
      
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    } catch (error) {
      console.error(error);
      setTitle(chat.title);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/chat/sessions/${chat.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      
      if (!res.ok) throw new Error("Failed to delete chat");
      
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      
      if (isActive) {
        setSelectedSessionId(null);
        window.location.href = "/dashboard/chat";
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete chat");
    }
  };

  return (
    <div
      className={cn(
        "group relative flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm leading-tight text-left transition-colors cursor-pointer",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
          : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
      )}
      onClick={() => {
        if (isEditing) return;
        setSelectedSessionId(chat.id);
        window.location.href = `/dashboard/chat/${chat.id}`;
      }}
    >
      {isEditing ? (
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleRename}
          onBlur={handleRename}
          className="flex-1 bg-background border border-sidebar-border px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-sidebar-ring w-full"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <span className="truncate flex-1">
            {title}
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto pl-2 flex shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-sidebar-accent-foreground/10 rounded transition-colors text-muted-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash className="h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </div>
  );
}
