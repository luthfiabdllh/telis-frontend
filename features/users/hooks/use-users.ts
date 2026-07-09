import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, GetUsersParams, RegisterRequest } from "../api/user-api";

export const useUsers = (params: GetUsersParams) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userApi.getUsers(params),
  });
};

export const useUserMetrics = () => {
  return useQuery({
    queryKey: ["users", "metrics"],
    queryFn: () => userApi.getMetrics(),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => userApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: number }) =>
      userApi.updateRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isBanned }: { userId: string; isBanned: boolean }) =>
      userApi.updateStatus(userId, isBanned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
