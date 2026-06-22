import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "../api/document-api";

export function useDrive(currentFolderId?: string | null) {
  const queryClient = useQueryClient();

  const foldersQuery = useQuery({
    queryKey: ["folders", currentFolderId],
    queryFn: () => documentApi.getFolders(currentFolderId),
  });

  const documentsQuery = useQuery({
    queryKey: ["documents", currentFolderId],
    queryFn: () => documentApi.getDocuments(currentFolderId),
  });

  const pathQuery = useQuery({
    queryKey: ["folder-path", currentFolderId],
    queryFn: () => documentApi.getFolderPath(currentFolderId as string),
    enabled: !!currentFolderId,
  });

  const invalidateDrive = () => {
    queryClient.invalidateQueries({ queryKey: ["folders", currentFolderId] });
    queryClient.invalidateQueries({ queryKey: ["documents", currentFolderId] });
  };

  const createFolder = useMutation({
    mutationFn: (name: string) => documentApi.createFolder(name, currentFolderId),
    onSuccess: () => invalidateDrive(),
  });

  const renameFolder = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => documentApi.renameFolder(id, name),
    onSuccess: () => invalidateDrive(),
  });

  const moveFolder = useMutation({
    mutationFn: ({ id, parentId }: { id: string; parentId?: string | null }) => documentApi.moveFolder(id, parentId),
    onSuccess: () => invalidateDrive(),
  });

  const deleteFolder = useMutation({
    mutationFn: (id: string) => documentApi.deleteFolder(id),
    onSuccess: () => invalidateDrive(),
  });

  const uploadDocument = useMutation({
    mutationFn: (file: File) => documentApi.uploadDocument(file, currentFolderId),
    onSuccess: () => invalidateDrive(),
  });

  const renameDocument = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => documentApi.renameDocument(id, name),
    onSuccess: () => invalidateDrive(),
  });

  const moveDocument = useMutation({
    mutationFn: ({ id, folderId }: { id: string; folderId?: string | null }) => documentApi.moveDocument(id, folderId),
    onSuccess: () => invalidateDrive(),
  });

  const deleteDocument = useMutation({
    mutationFn: (id: string) => documentApi.deleteDocument(id),
    onSuccess: () => invalidateDrive(),
  });

  const deprecateDocument = useMutation({
    mutationFn: (id: string) => documentApi.deprecateDocument(id),
    onSuccess: () => invalidateDrive(),
  });

  return {
    folders: foldersQuery.data ?? [],
    documents: documentsQuery.data ?? [],
    path: pathQuery.data ?? [],
    isLoading: foldersQuery.isLoading || documentsQuery.isLoading,
    createFolder,
    renameFolder,
    moveFolder,
    deleteFolder,
    uploadDocument,
    renameDocument,
    moveDocument,
    deleteDocument,
    deprecateDocument,
  };
}
