"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useChatStore } from "@/features/chat/store/use-chat-store";
import { Button } from "@/components/ui/button";
import { MessageSquare, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname } from "next/navigation";

export function LayoutHeader() {
  const { isChatHistoryOpen, toggleChatHistory } = useChatStore();
  const pathname = usePathname();
  const isChatRoute = pathname?.startsWith("/dashboard/chat");

  return (
    <header className="h-16 flex items-center px-4 border-b shrink-0 bg-white dark:bg-zinc-900 shadow-sm z-10 gap-2">
      <SidebarTrigger className="mr-2" />
      {isChatRoute && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleChatHistory}
          className="h-8 w-8"
          title={isChatHistoryOpen ? "Tutup Riwayat Obrolan" : "Buka Riwayat Obrolan"}
        >
          {isChatHistoryOpen ? (
            <PanelLeftClose className="h-4 w-4 opacity-70" />
          ) : (
            <PanelLeftOpen className="h-4 w-4 opacity-70" />
          )}
        </Button>
      )}
      <div className="font-semibold text-sm ml-2">Dashboard</div>
    </header>
  );
}
