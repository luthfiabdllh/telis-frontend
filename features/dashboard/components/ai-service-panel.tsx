"use client";

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { MessageSquare, ShieldAlert, FileSignature, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ChatContainer } from "@/features/chat/components/chat-container";
import { RedlineInterface } from "@/features/redlining/components/redline-interface";
import { useAiServiceStore } from "../stores/use-ai-service-store";

export function AiServicePanel() {
  const { isOpen, activeService, closeService } = useAiServiceStore();

  const getServiceDetails = () => {
    switch (activeService) {
      case "chat":
        return {
          title: "Legal Chat Assistant",
          description: "Tanyakan apapun terkait dokumen legal Anda kepada AI.",
          icon: MessageSquare,
        };

      case "redlining":
        return {
          title: "Smart Redlining",
          description: "Deteksi anomali klausul dan risiko dalam kontrak.",
          icon: FileSignature,
        };
      default:
        return null;
    }
  };

  const details = getServiceDetails();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeService()}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] border-l border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl shadow-2xl p-0 flex flex-col gap-0">
        {details && (
          <SheetHeader className="p-6 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/50 flex flex-col items-start text-left space-y-1 relative">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <details.icon className="w-6 h-6" />
              </div>
              <SheetTitle className="text-xl font-bold tracking-tight">{details.title}</SheetTitle>
            </div>
            <SheetDescription className="text-zinc-500 mt-2">
              {details.description}
            </SheetDescription>
            {activeService === "chat" && (
              <Link 
                href="/dashboard/chat" 
                onClick={closeService}
                className="absolute right-12 top-6 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Riwayat
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </SheetHeader>
        )}
        
        <div className="flex-1 overflow-auto bg-zinc-50/50 dark:bg-zinc-900/50">
          {/* Content placeholders */}
          {activeService === "chat" && (
            <div className="flex flex-col h-full w-full">
              <ChatContainer />
            </div>
          )}

          {activeService === "redlining" && (
            <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-950">
              <RedlineInterface />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
