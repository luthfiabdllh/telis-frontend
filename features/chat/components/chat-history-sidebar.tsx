"use client";

import * as React from "react";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash,
  ChevronDown,
} from "lucide-react";
import { Session } from "next-auth";
import {
  useChatStore,
  type ChatSession,
} from "@/features/chat/store/use-chat-store";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { isToday, isYesterday, subDays, isAfter } from "date-fns";
import {
  useChatSessions,
  useRenameChat,
  useDeleteChat,
} from "@/features/chat/hooks/use-chat";
import {
  renameChatSchema,
  type RenameChatFormValues,
} from "@/features/chat/schemas/chat";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { SparklesIcon } from "@/components/animate-ui/icons/sparkles";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Search } from "@/components/animate-ui/icons/search";
import { X } from "@/components/animate-ui/icons/x";

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

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChatSessions({ search: query });

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle click outside to close search
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isSearchExpanded &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node) &&
        query === ""
      ) {
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
    return data.pages.flatMap((page) =>
      Array.isArray(page) ? page : page.data || [],
    );
  }, [data]);

  // Grouping logic
  const groupedSessions = React.useMemo(() => {
    const groups: { [key: string]: ChatSession[] } = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: [],
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
        "absolute md:relative z-60 left-0 md:left-auto top-0 md:top-auto shadow-xl md:shadow-none border-r border-sidebar-border",
        !mounted || isChatHistoryOpen
          ? "w-[85vw] sm:w-80 opacity-100"
          : "w-0 opacity-0 border-none",
      )}
    >
      <div className="flex flex-col h-full w-[85vw] sm:w-80 px-4 py-4">
        {/* Header with animated search */}
        <div className="flex items-center justify-between h-10 mb-6 relative">
          {!isSearchExpanded ? (
            <>
              <h2 className="text-xl font-semibold">Chat History</h2>
              <div className="flex items-center gap-1">
                <AnimateIcon animateOnHover>
                  <button
                    onClick={() => setIsSearchExpanded(true)}
                    className="p-2 hover:bg-sidebar-accent rounded-full transition-colors text-muted-foreground"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </AnimateIcon>
                <AnimateIcon animateOnHover>
                  <button
                    onClick={() => setChatHistoryOpen(false)}
                    className="md:hidden p-2 hover:bg-sidebar-accent rounded-full transition-colors text-muted-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </AnimateIcon>
              </div>
            </>
          ) : (
            <div
              ref={searchInputRef}
              className="flex items-center w-full relative animate-in fade-in slide-in-from-right-4 duration-200"
            >
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
                <X animateOnHover className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <AnimateIcon animateOnHover>
          <button
            onClick={() => {
              setSelectedSessionId(null);
              window.location.href = "/dashboard/chat";
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-white dark:text-primary-foreground shadow-md transition-all hover:opacity-90 mb-6"
          >
            <Plus className="h-4 w-4" />
            New Chat
            <SparklesIcon className="h-4 w-4 ml-1" />
          </button>
        </AnimateIcon>

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

function ChatGroup({
  groupName,
  chats,
  session,
  selectedSessionId,
  setSelectedSessionId,
  pathname,
}: any) {
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
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform duration-200",
              !isOpen && "-rotate-90",
            )}
          />
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

function ChatItem({
  chat,
  session,
  selectedSessionId,
  setSelectedSessionId,
  pathname,
}: any) {
  const [isEditing, setIsEditing] = React.useState(false);
  const isActive =
    selectedSessionId === chat.id || pathname === "/dashboard/chat/" + chat.id;

  const renameMutation = useRenameChat();
  const deleteMutation = useDeleteChat();

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<RenameChatFormValues>({
    resolver: zodResolver(renameChatSchema),
    defaultValues: {
      title: chat.title,
    },
  });

  React.useEffect(() => {
    if (isEditing) {
      setTimeout(() => setFocus("title"), 50);
    }
  }, [isEditing, setFocus]);

  const onSubmit = (data: RenameChatFormValues) => {
    setIsEditing(false);
    if (data.title === chat.title) return;
    renameMutation.mutate(
      { id: chat.id, data },
      {
        onError: () => {
          reset({ title: chat.title }); // Revert on error
        },
      },
    );
  };

  const handleBlur = handleSubmit(onSubmit);

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    deleteMutation.mutate(chat.id, {
      onSuccess: () => {
        if (isActive) {
          setSelectedSessionId(null);
          window.location.href = "/dashboard/chat";
        }
      },
      onError: () => {
        alert("Failed to delete chat");
      },
    });
  };

  return (
    <div
      className={cn(
        "group relative flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm leading-tight text-left transition-colors cursor-pointer",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "hover:bg-sidebar-accent/50 text-sidebar-foreground",
      )}
      onClick={() => {
        if (isEditing) return;
        setSelectedSessionId(chat.id);
        window.location.href = `/dashboard/chat/${chat.id}`;
      }}
    >
      {isEditing ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            {...register("title")}
            onBlur={handleBlur}
            className={cn(
              "flex-1 bg-background border px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 w-full",
              errors.title
                ? "border-destructive focus:ring-destructive"
                : "border-sidebar-border focus:ring-sidebar-ring",
            )}
          />
        </form>
      ) : (
        <>
          <span className="truncate flex-1">{chat.title}</span>
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
