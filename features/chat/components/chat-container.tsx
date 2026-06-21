"use client";

import { useChatLogic } from "../hooks/use-chat-logic";
import { ChatInterface } from "./chat-interface";

export const ChatContainer = () => {
  const chatLogic = useChatLogic();

  return <ChatInterface {...chatLogic} />;
};
