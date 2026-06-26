import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "../api/document-api";

export function useDrive(
  currentFolderId?: string | null, 
  search?: string, 
  isGlobal?: boolean, 
  documentType?: string,
  riskLevel?: string,
  vendorName?: string,
  businessUnit?: string,
  sortBy?: string,
  sortOrder?: string
) {
  const queryClient = useQueryClient();

  const foldersQuery = useQuery({
    queryKey: ["folders", currentFolderId, search, isGlobal],
    queryFn: () => documentApi.getFolders(currentFolderId, search, isGlobal),
  });

  const documentsQuery = useQuery({
    queryKey: ["documents", currentFolderId, search, isGlobal, documentType, riskLevel, vendorName, businessUnit, sortBy, sortOrder],
    queryFn: () => documentApi.getDocuments(currentFolderId, search, isGlobal, documentType, riskLevel, vendorName, businessUnit, sortBy, sortOrder),
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
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (p: number) => void }) => 
      documentApi.uploadDocument(file, currentFolderId, null, onProgress),
    onSuccess: () => {
      invalidateDrive();
      // Ingestion is asynchronous in the background worker, so we poll for a few seconds to update the UI automatically
      let count = 0;
      const interval = setInterval(() => {
        invalidateDrive();
        count++;
        if (count > 7) clearInterval(interval); // Poll up to 14 seconds
      }, 2000);
    },
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

  const restoreDocument = useMutation({
    mutationFn: (id: string) => documentApi.restoreDocument(id),
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
    restoreDocument,
  };
}
