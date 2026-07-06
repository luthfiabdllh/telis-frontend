import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";

import { cn } from "@/lib/utils";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputButton,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { SpeechInput } from "@/components/ai-elements/speech-input";
import { Suggestions } from "@/components/ai-elements/suggestion";
import { type MessageType, suggestions } from "../schemas/chat";
import { SuggestionItem } from "./suggestion-item";
import { MessageFeedback } from "./message-feedback";
import { Badge } from "@/components/ui/badge";
import { Filter, Paperclip, Loader2 } from "lucide-react";
import { useRef } from "react";
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentInfo,
  AttachmentRemove,
} from "@/components/ai-elements/attachments";

const CATEGORIES = [
  "NDA",
  "PROCUREMENT_CONTRACT",
  "PARTNERSHIP_AGREEMENT",
  "SLA_AGREEMENT",
  "COMPLIANCE_DOCUMENT",
  "INTERNAL_POLICY",
  "LEGAL_CORRESPONDENCE",
  "MINUTES_OF_MEETING",
  "LITIGATION_DOCUMENT",
  "OTHER",
];

export interface ChatInterfaceProps {
  text: string;
  status: "submitted" | "streaming" | "ready" | "error";
  messages: MessageType[];
  handleSubmit: (message: any) => void;
  handleSuggestionClick: (suggestion: string) => void;
  handleTranscriptionChange: (transcript: string) => void;
  handleTextChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isSubmitDisabled: boolean;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  attachedFile: File | null;
  setAttachedFile: (file: File | null) => void;
  isExtracting: boolean;
}

import { useChatStore } from "../store/use-chat-store";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSession } from "next-auth/react";

export const ChatInterface = ({
  text,
  status,
  messages,
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
}: ChatInterfaceProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isChatHistoryOpen, setChatHistoryOpen } = useChatStore();
  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const isEmpty = messages.length === 0;

  const renderFilters = (isCentered: boolean) => (
    <div
      className={cn(
        "flex items-center w-full min-w-0",
        isCentered ? "flex-col gap-3 justify-center" : "mb-3",
      )}
    >
      <div
        className={cn(
          "flex items-center text-muted-foreground shrink-0",
          isCentered ? "" : "mr-3",
        )}
      >
        <Filter className="w-4 h-4 mr-1.5" />
        <span className="text-xs font-medium uppercase tracking-wider">
          Filter:
        </span>
      </div>
      <div
        className={cn(
          "flex-1 min-w-0 overflow-x-auto no-scrollbar flex gap-2 pb-1 pr-14 scroll-smooth",
          isCentered ? "justify-center flex-wrap pr-0" : "",
        )}
        style={{
          maskImage: isCentered
            ? "none"
            : "linear-gradient(to right, black 90%, transparent 100%)",
          WebkitMaskImage: isCentered
            ? "none"
            : "linear-gradient(to right, black 90%, transparent 100%)",
        }}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat);
          const isLast =
            !isCentered && cat === CATEGORIES[CATEGORIES.length - 1];
          return (
            <Badge
              key={cat}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer whitespace-nowrap transition-all duration-200 shrink-0 ${isSelected ? "bg-emerald-600 hover:bg-emerald-700 shadow-sm" : "hover:bg-muted/60 text-muted-foreground font-normal"} ${isLast ? "mr-6" : ""}`}
              onClick={() => toggleCategory(cat)}
            >
              {cat.replace(/_/g, " ")}
            </Badge>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative flex size-full flex-col overflow-hidden">
      {/* Glowing Orb Background */}
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out mix-blend-screen dark:mix-blend-lighten",
          isEmpty ? "opacity-100" : "opacity-0"
        )}
      >
        <div 
          className="absolute top-1/2 left-[25%] w-[400px] h-[400px] -translate-y-1/2 bg-indigo-400/20 dark:bg-indigo-600/25 rounded-full blur-[100px] animate-pulse" 
          style={{ animationDuration: '6s' }} 
        />
        <div 
          className="absolute top-1/2 right-[25%] w-[300px] h-[300px] -translate-y-1/2 bg-purple-400/20 dark:bg-purple-600/25 rounded-full blur-[100px] animate-pulse" 
          style={{ animationDuration: '8s' }} 
        />
      </div>

      <div className="absolute top-4 left-4 z-10">
        <Button
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur-md shadow-sm text-muted-foreground hover:text-foreground hover:bg-background border border-sidebar-border"
          onClick={() => setChatHistoryOpen(!isChatHistoryOpen)}
          title={isChatHistoryOpen ? "Tutup Riwayat" : "Buka Riwayat"}
        >
          {isChatHistoryOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </Button>
      </div>
      {!isEmpty && (
        <Conversation>
          <ConversationContent className="pt-14">
            {messages.map(({ versions, ...message }) => (
              <MessageBranch defaultBranch={0} key={message.key}>
                <MessageBranchContent>
                  {versions.map((version) => (
                    <Message
                      from={message.from}
                      key={`${message.key}-${version.id}`}
                    >
                      <div>
                        {(message.sources?.length ?? 0) > 0 && (
                          <Sources>
                            <SourcesTrigger
                              count={message.sources?.length || 0}
                            />
                            <SourcesContent>
                              {message.sources?.map((source, index) => (
                                <Source
                                  href={source.href}
                                  key={source.title + index}
                                  title={source.title}
                                />
                              ))}
                            </SourcesContent>
                          </Sources>
                        )}
                        {message.reasoning && (
                          <Reasoning duration={message.reasoning.duration}>
                            <ReasoningTrigger />
                            <ReasoningContent>
                              {message.reasoning.content}
                            </ReasoningContent>
                          </Reasoning>
                        )}
                        <MessageContent>
                          {(() => {
                            let content = version.content;
                            let attachmentName = null;
                            const match = content.match(
                              /^\[ATTACHMENT:(.*?)\]\n\n/,
                            );
                            if (match) {
                              attachmentName = match[1];
                              content = content.replace(match[0], "");
                            }
                            return (
                              <>
                                {attachmentName && (
                                  <div className="flex flex-col gap-1 rounded-md bg-white p-3 mb-2 w-fit min-w-[140px] max-w-[250px] border border-gray-200 shadow-sm">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                      {attachmentName.split(".").pop() || "TXT"}
                                    </div>
                                    <div
                                      className="text-xs text-gray-800 font-medium truncate"
                                      title={attachmentName}
                                    >
                                      {attachmentName}
                                    </div>
                                  </div>
                                )}
                                <MessageResponse>{content}</MessageResponse>
                              </>
                            );
                          })()}
                        </MessageContent>
                        {message.from === "assistant" && versions[0].id && (
                          <div className="opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-1 mt-2">
                            <MessageFeedback
                              messageId={versions[0].id}
                              initialFeedback={message.feedback}
                            />
                          </div>
                        )}
                      </div>
                    </Message>
                  ))}
                </MessageBranchContent>
                {versions.length > 1 && (
                  <MessageBranchSelector>
                    <MessageBranchPrevious />
                    <MessageBranchPage />
                    <MessageBranchNext />
                  </MessageBranchSelector>
                )}
              </MessageBranch>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      )}

      <div
        className={cn(
          "flex w-full flex-col transition-all duration-500 ease-in-out relative z-10",
          isEmpty
            ? "flex-1 items-center justify-center p-4"
            : "shrink-0 border-t pt-4",
        )}
      >
        {isEmpty && (
          <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Telis AI</h1>
            <p className="text-muted-foreground text-lg">
              Apa yang bisa kami bantu hari ini?
            </p>
          </div>
        )}
        <div
          className={cn(
            "w-full transition-all duration-500",
            isEmpty ? "max-w-3xl" : "px-4 pb-4 max-w-full min-w-0",
          )}
        >
          {!isEmpty && renderFilters(false)}

          <div className="bg-background/60 backdrop-blur-xl border border-border/50 shadow-lg rounded-2xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30">
            <PromptInput
              onSubmit={handleSubmit}
              className="border-none shadow-none bg-transparent"
            >
              <PromptInputBody>
                {attachedFile && (
                  <div className="w-full flex justify-start px-3 pt-3">
                    <Attachments variant="inline">
                      <Attachment
                        data={{
                          id: "upload",
                          type: "file",
                          filename: attachedFile.name,
                          mediaType: attachedFile.type,
                          url: URL.createObjectURL(attachedFile),
                        }}
                        onRemove={() => {
                          setAttachedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        <AttachmentPreview />
                        <AttachmentInfo />
                        <AttachmentRemove />
                      </Attachment>
                    </Attachments>
                  </div>
                )}
                {isExtracting && (
                  <div className="flex items-center gap-2 px-3 py-1.5 mb-2 mx-3 mt-2 text-muted-foreground text-xs font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Mengekstrak teks...
                  </div>
                )}
                <PromptInputTextarea
                  onChange={handleTextChange}
                  value={text}
                  disabled={
                    status === "streaming" ||
                    status === "submitted" ||
                    isExtracting
                  }
                />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setAttachedFile(e.target.files[0]);
                      }
                      e.target.value = "";
                    }}
                  />
                  <PromptInputButton
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExtracting}
                    tooltip="Lampirkan Dokumen (PDF)"
                  >
                    <Paperclip className="size-4" />
                  </PromptInputButton>

                  <SpeechInput
                    className="shrink-0"
                    onTranscriptionChange={handleTranscriptionChange}
                    size="icon-sm"
                    variant="ghost"
                  />
                </PromptInputTools>
                <PromptInputSubmit
                  disabled={isSubmitDisabled}
                  status={status}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>

          {isEmpty && (
            <div className="mt-8 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150 fill-mode-both">
              <Suggestions className="px-4">
                {suggestions.map((suggestion) => (
                  <SuggestionItem
                    key={suggestion}
                    onClick={handleSuggestionClick}
                    suggestion={suggestion}
                  />
                ))}
              </Suggestions>
              <div className="w-full max-w-2xl mt-4">{renderFilters(true)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
