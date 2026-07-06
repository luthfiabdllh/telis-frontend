import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi, GetSessionsParams, RenameChatRequest } from "../api/chat-api";

export const useChatSessions = (params: GetSessionsParams) => {
  return useInfiniteQuery({
    queryKey: ["chat-sessions", params],
    queryFn: async ({ pageParam = 1 }) => {
      return chatApi.getSessions({ ...params, page: pageParam as number, limit: 20 });
    },
    getNextPageParam: (lastPage: any, allPages) => {
      if (Array.isArray(lastPage)) {
        return lastPage.length === 20 ? allPages.length + 1 : undefined;
      }
      return lastPage.hasNextPage ? lastPage.nextCursor || allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useChatMessages = (sessionId: string | undefined) => {
  return useQuery({
    queryKey: ["chat-messages", sessionId],
    queryFn: () => {
      if (!sessionId) throw new Error("No session ID");
      return chatApi.getSessionMessages(sessionId);
    },
    enabled: !!sessionId,
    staleTime: 0,
  });
};

export const useRenameChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RenameChatRequest }) =>
      chatApi.renameSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    },
  });
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => chatApi.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    },
  });
};
