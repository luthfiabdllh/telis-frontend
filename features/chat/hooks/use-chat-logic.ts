import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { type MessageType } from "../schemas/chat";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { getSession } from "next-auth/react";
import { nanoid } from "nanoid";
import { apiClient } from "@/lib/api-client";

export function useChatLogic(initialSessionId?: string) {
  const [text, setText] = useState<string>("");
  const [status, setStatus] = useState<"submitted" | "streaming" | "ready" | "error">("ready");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const sessionIdRef = useRef(initialSessionId);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Fetch History if sessionId exists
  useEffect(() => {
    if (initialSessionId) {
      const fetchHistory = async () => {
        try {
          const res = await apiClient.get(`/api/v1/chat/sessions/${initialSessionId}/messages`);
          const history = res.data;
          if (Array.isArray(history)) {
            const mappedMessages: MessageType[] = history.map((msg: any) => ({
              from: msg.sender as "user" | "assistant",
              key: msg.id || nanoid(),
              versions: [
                {
                  id: msg.id || nanoid(),
                  content: msg.content,
                },
              ],
            }));
            setMessages(mappedMessages);
          }
        } catch (error) {
          console.error("Failed to fetch history", error);
        }
      };
      fetchHistory();
    }
  }, [initialSessionId]);

  const streamResponse = async (content: string) => {
    setStatus("streaming");
    setStreamingContent("");

    let currentSessionId = sessionIdRef.current;
    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID();
      setSessionId(currentSessionId);
      sessionIdRef.current = currentSessionId;
      window.history.replaceState(null, "", `/dashboard/chat/${currentSessionId}`);
    }

    try {
      const session = await getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken || ""}`,
        },
        body: JSON.stringify({
          session_id: currentSessionId,
          message: content,
          document_filters: [],
          llm_temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let fullText = "";
      let currentEvent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const lines = value.split("\n");
        for (const line of lines) {
          if (line.startsWith("event:")) {
             currentEvent = line.substring(6).trim();
          } else if (line.startsWith("data:")) {
            let data = line.substring(5);
            if (data.startsWith(" ")) data = data.substring(1);
            
            if (currentEvent === "done" || data === "[DONE]") {
              // stream finished
              break;
            } else if (currentEvent === "message" || currentEvent === "") {
              fullText += data;
              setStreamingContent(fullText);
            }
          }
        }
      }

      // Finalize message
      const assistantMessage: MessageType = {
        from: "assistant",
        key: `assistant-${Date.now()}`,
        versions: [
          {
            content: fullText,
            id: `assistant-${Date.now()}`,
          },
        ],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStatus("ready");
      setStreamingContent("");
    } catch (error) {
      console.error("Streaming error:", error);
      setStatus("error");
    }
  };

  const addUserMessage = useCallback(
    (content: string) => {
      const userMessage: MessageType = {
        from: "user",
        key: `user-${Date.now()}`,
        versions: [
          {
            content,
            id: `user-${Date.now()}`,
          },
        ],
      };

      setMessages((prev) => [...prev, userMessage]);

      // We can call streamResponse directly here because it does not rely on outdated closures
      // other than sessionIdRef which is mutable and fresh.
      streamResponse(content);
    },
    [] 
  );

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (!message.text) return;
      setStatus("submitted");
      addUserMessage(message.text);
      setText("");
    },
    [addUserMessage]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setStatus("submitted");
      addUserMessage(suggestion);
    },
    [addUserMessage]
  );

  const handleTranscriptionChange = useCallback((transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  }, []);

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
    []
  );

  const isSubmitDisabled = useMemo(
    () => !(text.trim() || status) || status === "streaming",
    [text, status]
  );

  const displayMessages = useMemo(() => {
    if (status === "streaming") {
      return [
        ...messages,
        {
          from: "assistant",
          key: "streaming-key",
          versions: [
            {
              id: "streaming-id",
              content: streamingContent,
            },
          ],
        } as MessageType,
      ];
    }
    return messages;
  }, [messages, status, streamingContent]);

  return {
    text,
    status,
    messages: displayMessages,
    handleSubmit,
    handleSuggestionClick,
    handleTranscriptionChange,
    handleTextChange,
    isSubmitDisabled,
  };
}
