"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ShieldAlert, FileSignature, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAiServiceStore, AiServiceType } from "../stores/use-ai-service-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";

interface ServiceItem {
  id: AiServiceType;
  icon: React.ElementType;
  label: string;
  hasNotification?: boolean;
}

const services: ServiceItem[] = [
  { id: "chat", icon: MessageSquare, label: "Legal Chat Assistant" },
  { id: "redlining", icon: FileSignature, label: "Smart Redlining" },
];

export function ServiceBar() {
  const { activeService, toggleService } = useAiServiceStore();
  const pathname = usePathname();

  // Filter out 'chat' service if we are already on the chat page
  const visibleServices = services.filter(
    (service) => !(service.id === "chat" && pathname === "/dashboard/chat")
  );

  if (visibleServices.length === 0) return null;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
        className="flex flex-col gap-3 p-3 rounded-[2rem] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl"
      >
        {visibleServices.map((service) => {
          const isActive = activeService === service.id;
          const Icon = service.icon;

          return (
            <Tooltip key={service.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => toggleService(service.id)}
                  className="relative group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-300 relative",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    
                    {/* Active State Glow */}
                    {isActive && (
                      <motion.div
                        layoutId="active-glow"
                        className="absolute inset-0 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Notification Dot */}
                    {service.hasNotification && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white dark:border-zinc-900"></span>
                      </span>
                    )}
                  </motion.div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" sideOffset={16} className="font-medium">
                {service.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </motion.div>
    </div>
  );
}
