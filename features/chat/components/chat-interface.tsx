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

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
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
import { Filter } from "lucide-react";

const CATEGORIES = [
  "NDA", "PROCUREMENT_CONTRACT", "PARTNERSHIP_AGREEMENT",
  "SLA_AGREEMENT", "REGULATORY_DOCUMENT", "COMPLIANCE_DOCUMENT",
  "INTERNAL_POLICY", "LEGAL_CORRESPONDENCE", "MINUTES_OF_MEETING",
  "LITIGATION_DOCUMENT", "OTHER"
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
}

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
}: ChatInterfaceProps) => {
  
  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  return (
    <div className="relative flex size-full flex-col divide-y overflow-hidden">
      <Conversation>
        <ConversationContent>
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
                          <SourcesTrigger count={message.sources?.length || 0} />
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
                        <MessageResponse>{version.content}</MessageResponse>
                      </MessageContent>
                      {message.from === "assistant" && versions[0].id && (
                        <div className="opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-1 mt-2">
                          <MessageFeedback messageId={versions[0].id} initialFeedback={message.feedback} />
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
      <div className="grid shrink-0 gap-4 pt-4 min-w-0 w-full">
        {messages.length === 0 && (
          <Suggestions className="px-4">
            {suggestions.map((suggestion) => (
              <SuggestionItem
                key={suggestion}
                onClick={handleSuggestionClick}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
        )}
        <div className="w-full min-w-0 max-w-full px-4 pb-4">
          <div className="mb-3 flex items-center w-full min-w-0">
            <div className="flex items-center mr-3 text-muted-foreground shrink-0">
              <Filter className="w-4 h-4 mr-1.5" />
              <span className="text-xs font-medium uppercase tracking-wider">Filter:</span>
            </div>
            <div 
              className="flex-1 min-w-0 overflow-x-auto no-scrollbar flex gap-2 pb-1 pr-14 scroll-smooth" 
              style={{ maskImage: "linear-gradient(to right, black 90%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 90%, transparent 100%)" }}
            >
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                const isLast = cat === CATEGORIES[CATEGORIES.length - 1];
                return (
                  <Badge 
                    key={cat} 
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer whitespace-nowrap transition-all duration-200 shrink-0 ${isSelected ? "bg-emerald-600 hover:bg-emerald-700 shadow-sm" : "hover:bg-muted/60 text-muted-foreground font-normal"} ${isLast ? 'mr-6' : ''}`}                    onClick={() => toggleCategory(cat)}
                  >
                    {cat.replace(/_/g, ' ')}
                  </Badge>
                );
              })}
            </div>
          </div>
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea onChange={handleTextChange} value={text} disabled={status === "streaming" || status === "submitted"} />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>

                <SpeechInput
                  className="shrink-0"
                  onTranscriptionChange={handleTranscriptionChange}
                  size="icon-sm"
                  variant="ghost"
                />

              </PromptInputTools>
              <PromptInputSubmit disabled={isSubmitDisabled} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
