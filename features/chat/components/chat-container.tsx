"use client";

import { useChatLogic } from "../hooks/use-chat-logic";
import { ChatInterface } from "./chat-interface";

export const ChatContainer = ({ sessionId }: { sessionId?: string }) => {
  const chatLogic = useChatLogic(sessionId);

  return <ChatInterface {...chatLogic} />;
};
