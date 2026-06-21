import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { type MessageType } from "../schemas/chat";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { getSession } from "next-auth/react";
import { nanoid } from "nanoid";
import { apiClient } from "@/lib/api-client";
import { fetchEventSource } from "@microsoft/fetch-event-source";

export function useChatLogic(initialSessionId?: string) {
  const [text, setText] = useState<string>("");
  const [status, setStatus] = useState<"submitted" | "streaming" | "ready" | "error">("ready");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [streamingReasoning, setStreamingReasoning] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const sessionIdRef = useRef(initialSessionId);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (initialSessionId) {
      const fetchHistory = async () => {
        try {
          // apiClient automatically prepends NEXT_PUBLIC_API_URL which already contains /api/v1
          const res = await apiClient.get(`/chat/sessions/${initialSessionId}/messages`);
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
    setStreamingReasoning("");

    let currentSessionId = sessionIdRef.current;
    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID();
      setSessionId(currentSessionId);
      sessionIdRef.current = currentSessionId;
      window.history.replaceState(null, "", `/dashboard/chat/${currentSessionId}`);
    }

    try {
      const session = await getSession();
      // Ensure we don't append /api/v1 if it's already in the env variable
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const streamUrl = baseUrl.endsWith("/api/v1") ? `${baseUrl}/chat/stream` : `${baseUrl}/api/v1/chat/stream`;
      
      let fullText = "";
      class RetriableError extends Error {}
      class FatalError extends Error {}

      await new Promise<void>((resolve, reject) => {
        fetchEventSource(streamUrl, {
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
          async onopen(res) {
            if (res.ok && res.status === 200) {
              return; // everything's good
            } else if (res.status >= 400 && res.status < 500 && res.status !== 429) {
              throw new FatalError(); // client error
            } else {
              throw new RetriableError();
            }
          },
          onmessage(ev) {
            if (ev.event === "error") {
              setStreamingContent((prev) => {
                fullText = prev + `\n\n**[ERROR]: ${ev.data}**`;
                return fullText;
              });
              setStatus("error");
              reject(new Error(ev.data));
              return;
            }
            if (ev.event === "done" || ev.data === "[DONE]") {
              resolve();
              return;
            }
            if (ev.event === "status") {
              setStreamingReasoning((prev) => prev ? `${prev}\n- ${ev.data}` : `- ${ev.data}`);
            } else if (ev.event === "message" || ev.event === "") {
              setStreamingContent((prev) => {
                fullText = prev + ev.data;
                return fullText;
              });
            }
          },
          onclose() {
            resolve();
          },
          onerror(err) {
            if (err instanceof FatalError) {
              reject(err);
              throw err; // rethrow to stop retrying
            } else {
              // retry
            }
          }
        });
      });

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
          reasoning: streamingReasoning ? { content: streamingReasoning, duration: 0 } : undefined,
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
  }, [messages, status, streamingContent, streamingReasoning]);

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
