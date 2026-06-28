import React from "react";
import { RedlineInterface } from "@/features/redlining/components/redline-interface";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Redlining | TELIS",
  description: "Bandingkan dua versi kontrak untuk mendeteksi perubahan klausa dan risiko secara otomatis.",
};

export default function RedliningPage() {
  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <RedlineInterface />
      </div>
    </div>
  );
}
