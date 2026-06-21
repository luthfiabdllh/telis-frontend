import { ChatContainer } from "@/features/chat/components/chat-container";
import { notFound } from "next/navigation";

export default function ChatSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  if (!params.sessionId) {
    return notFound();
  }
  return <ChatContainer sessionId={params.sessionId} />;
}
