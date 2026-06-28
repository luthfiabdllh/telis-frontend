import { apiClient } from "@/lib/api-client";

export interface RegisterRequest {
  username: string;
  email: string;
  password?: string;
  role_id: number;
}

export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role_id: number;
  role: Role;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedUsers {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role_id?: number | null;
  is_banned?: boolean | null;
}

export const userApi = {
  getUsers: async (params: GetUsersParams): Promise<PaginatedUsers> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.role_id !== undefined && params.role_id !== null) searchParams.set('role_id', params.role_id.toString());
    if (params.is_banned !== undefined && params.is_banned !== null) searchParams.set('is_banned', params.is_banned.toString());

    const queryString = searchParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    const res = await apiClient.get(endpoint);
    return res.data;
  },

  createUser: async (data: RegisterRequest): Promise<{ message: string; user: Record<string, unknown> }> => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },

  updateRole: async (userId: string, roleId: number): Promise<{ message: string }> => {
    const res = await apiClient.put(`/users/${userId}/role`, { role_id: roleId });
    return res.data;
  },

  updateStatus: async (userId: string, isBanned: boolean): Promise<{ message: string }> => {
    const res = await apiClient.put(`/users/${userId}/ban`, { is_banned: isBanned });
    return res.data;
  },

  searchUsers: async (q: string): Promise<Array<{ id: string; username: string; email: string }>> => {
    const res = await apiClient.get(`/users/search?q=${encodeURIComponent(q)}`);
    return res.data;
  },
};
