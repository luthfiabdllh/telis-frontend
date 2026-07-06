import { apiClient } from "@/lib/api-client";
import type { ChatSession } from "@/features/chat/store/use-chat-store";

export interface PaginatedChatSessions {
  data: ChatSession[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  hasNextPage?: boolean;
  nextCursor?: number;
}

export interface GetSessionsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface RenameChatRequest {
  title: string;
}

export const chatApi = {
  getSessions: async (params: GetSessionsParams) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.search) searchParams.set("search", params.search);

    const queryString = searchParams.toString();
    const endpoint = `/chat/sessions${queryString ? `?${queryString}` : ""}`;
    const res = await apiClient.get(endpoint);
    return res.data;
  },

  renameSession: async (id: string, data: RenameChatRequest) => {
    const res = await apiClient.put(`/chat/sessions/${id}/title`, data);
    return res.data;
  },

  deleteSession: async (id: string) => {
    const res = await apiClient.delete(`/chat/sessions/${id}`);
    return res.data;
  },

  getSessionMessages: async (id: string) => {
    const res = await apiClient.get(`/chat/sessions/${id}/messages`);
    return res.data;
  },
};
