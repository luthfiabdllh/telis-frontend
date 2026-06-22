import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { type MessageType } from "../schemas/chat";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { getSession } from "next-auth/react";
import { nanoid } from "nanoid";
import { apiClient } from "@/lib/api-client";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useQuery } from "@tanstack/react-query";

export function useChatLogic(initialSessionId?: string) {
  const [text, setText] = useState<string>("");
  const [status, setStatus] = useState<"submitted" | "streaming" | "ready" | "error">("ready");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [streamingReasoning, setStreamingReasoning] = useState<string>("");
  const [streamingSources, setStreamingSources] = useState<{title: string, href: string}[] | undefined>();
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const sessionIdRef = useRef(initialSessionId);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const { data: historyData } = useQuery({
    queryKey: ["chat-messages", initialSessionId],
    queryFn: async () => {
      const res = await apiClient.get(`/chat/sessions/${initialSessionId}/messages`);
      return res.data;
    },
    enabled: !!initialSessionId,
    staleTime: 0, // ensure it refetches if we revisit
  });

  useEffect(() => {
    if (historyData && Array.isArray(historyData)) {
      const mappedMessages: MessageType[] = historyData.map((msg: any) => {
        const parsedSources = Array.isArray(msg.sources) ? msg.sources : [];
        return {
          from: msg.sender as "user" | "assistant",
          key: msg.id || nanoid(),
          sources: parsedSources,
          versions: [
            {
              id: msg.id || nanoid(),
              content: msg.content,
            },
          ],
        };
      });
      setMessages(mappedMessages);
    }
  }, [historyData]);

  const streamResponse = async (content: string) => {
    setStatus("streaming");
    setStreamingContent("");
    setStreamingReasoning("");
    setStreamingSources(undefined);

    let currentSessionId = sessionIdRef.current;
    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID();
      setSessionId(currentSessionId);
      sessionIdRef.current = currentSessionId;
      window.history.replaceState(null, "", `/dashboard/chat/${currentSessionId}`);
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

    try {
      const session = await getSession();
      const token = session?.accessToken || "";
      
      let fullText = "";
      let collectedSources: {title: string, href: string}[] | undefined;
      class RetriableError extends Error {}
      class FatalError extends Error {}

      await new Promise<void>((resolve, reject) => {
        fetchEventSource(`${apiUrl}/chat/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
            } else {
              // Treat all non-200 as fatal to prevent infinite loops (e.g. 429 or 500)
              throw new FatalError(`Server returned ${res.status}`); 
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
            if (ev.event === "sources") {
              try {
                const parsedSources = JSON.parse(ev.data);
                collectedSources = parsedSources;
                setStreamingSources(parsedSources);
              } catch (e) {
                console.error("Failed to parse sources", e);
              }
            } else if (ev.event === "status") {
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
            reject(err);
            throw err; // rethrow to stop all retries
          }
        });
      });

      // Finalize message
      const assistantMessage: MessageType = {
        from: "assistant",
        key: `assistant-${Date.now()}`,
        sources: collectedSources,
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
      setStreamingSources(undefined);
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
          sources: streamingSources,
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
  }, [messages, status, streamingContent, streamingReasoning, streamingSources]);

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
