import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { type MessageType } from "../schemas/chat";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { getSession } from "next-auth/react";
import { nanoid } from "nanoid";
import { apiClient } from "@/lib/api-client";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useChatLogic(initialSessionId?: string) {
  const queryClient = useQueryClient();
  const [text, setText] = useState<string>("");
  const [status, setStatus] = useState<"submitted" | "streaming" | "ready" | "error">("ready");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [streamingReasoning, setStreamingReasoning] = useState<string>("");
  const [streamingSources, setStreamingSources] = useState<{title: string, href: string}[] | undefined>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
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
          from: (msg.sender === "ai" ? "assistant" : msg.sender) as "user" | "assistant",
          key: msg.id || nanoid(),
          sources: parsedSources,
          feedback: msg.feedback,
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

  const isSubmittingRef = useRef(false);

  const streamResponse = async (content: string, contextData?: string) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    
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
      let finished = false;
      class RetriableError extends Error {}
      class FatalError extends Error {}

      const ctrl = new AbortController();

      await new Promise<void>((resolve, reject) => {
        fetchEventSource(`${apiUrl}/chat/stream`, {
          method: "POST",
          signal: ctrl.signal,
          openWhenHidden: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            session_id: currentSessionId,
            message: content,
            document_filters: selectedCategories,
            llm_temperature: 0.7,
            context_data: contextData || "",
          }),
          async onopen(res) {
            if (res.ok && res.status === 200) {
              // Invalidate sessions list so the sidebar updates automatically
              queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
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
              ctrl.abort();
              return;
            }
            if (ev.event === "done" || ev.data === "[DONE]") {
              finished = true;
              queryClient.invalidateQueries({ queryKey: ["chat-messages", currentSessionId] });
              resolve();
              ctrl.abort();
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
              let chunk = ev.data;
              try { chunk = JSON.parse(ev.data); } catch (e) {}
              setStreamingReasoning((prev) => prev ? `${prev}\n- ${chunk}` : `- ${chunk}`);
            } else if (ev.event === "message" || ev.event === "") {
              let chunk = ev.data;
              try { chunk = JSON.parse(ev.data); } catch (e) {}
              setStreamingContent((prev) => {
                fullText = prev + chunk;
                return fullText;
              });
            }
          },
          onclose() {
            if (!finished) {
              reject(new Error("Stream closed unexpectedly by the server"));
            } else {
              resolve();
            }
            throw new FatalError("Stop fetch-event-source from retrying");
          },
          onerror(err) {
            ctrl.abort(); // Immediately cancel any internal fetch state to prevent retry
            reject(err);
            throw new FatalError(err?.message || "Streaming Error"); // Rethrow FatalError to force stop
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
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const addUserMessage = useCallback(
    (content: string, contextData?: string) => {
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

      streamResponse(content, contextData);
    },
    [] 
  );

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      if (!message.text) return;
      if (isSubmittingRef.current || isExtracting) return;
      
      setStatus("submitted");
      
      let contextData = "";
      if (attachedFile) {
        setIsExtracting(true);
        try {
          const formData = new FormData();
          formData.append("file", attachedFile);
          const res = await apiClient.post("/chat/extract-text", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          contextData = res.data?.text || "";
        } catch (e) {
          console.error("Failed to extract text from file", e);
        } finally {
          setIsExtracting(false);
          setAttachedFile(null); // Clear file after sending
        }
      }
      
      addUserMessage(message.text, contextData);
      setText("");
    },
    [addUserMessage, attachedFile, isExtracting]
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
    () => !(text.trim() || status) || status === "streaming" || isExtracting,
    [text, status, isExtracting]
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
    selectedCategories,
    setSelectedCategories,
    attachedFile,
    setAttachedFile,
    isExtracting,
  };
}
