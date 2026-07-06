"use client";

import * as React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { getSession } from "next-auth/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MessageFeedback({ messageId, initialFeedback }: { messageId: string; initialFeedback?: any }) {
  const [feedback, setFeedback] = React.useState(initialFeedback);

  // Sync state if initialFeedback changes (e.g. from polling/fetching history)
  React.useEffect(() => {
    if (initialFeedback) {
      setFeedback(initialFeedback);
    }
  }, [initialFeedback]);

  const handleRate = async (rating: 1 | -1) => {
    const newRating = feedback?.rating === rating ? 0 : rating;
    const prevFeedback = feedback;
    
    // Optimistic update
    setFeedback({ ...feedback, rating: newRating });

    try {
      const session = await getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/chat/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          message_id: messageId,
          rating: newRating,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to submit rating");
      }
      const data = await res.json();
      setFeedback(data.data);
    } catch (error) {
      console.error(error);
      setFeedback(prevFeedback); // revert
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleRate(1)}
              className={`p-1.5 rounded hover:bg-muted transition-colors ${
                feedback?.rating === 1 ? "text-green-600 dark:text-green-500 bg-muted" : "text-muted-foreground"
              }`}
              title="Membantu"
            >
              <ThumbsUp className="w-3.5 h-3.5" fill={feedback?.rating === 1 ? "currentColor" : "none"} />
            </button>
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleRate(-1)}
              className={`p-1.5 rounded hover:bg-muted transition-colors ${
                feedback?.rating === -1 ? "text-red-600 dark:text-red-500 bg-muted" : "text-muted-foreground"
              }`}
              title="Kurang Membantu"
            >
              <ThumbsDown className="w-3.5 h-3.5" fill={feedback?.rating === -1 ? "currentColor" : "none"} />
            </button>
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
