import { auth } from "@/auth";
import { ChatHistorySidebar } from "@/features/chat/components/chat-history-sidebar";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex w-full h-full absolute inset-0 overflow-hidden rounded-xl">
      <ChatHistorySidebar session={session} />
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {children}
      </div>
    </div>
  );
}
