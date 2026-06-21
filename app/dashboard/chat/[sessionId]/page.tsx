import { ChatContainer } from "@/features/chat/components/chat-container";
import { notFound } from "next/navigation";

export default async function ChatSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  
  if (!sessionId) {
    return notFound();
  }
  return <ChatContainer sessionId={sessionId} />;
}
