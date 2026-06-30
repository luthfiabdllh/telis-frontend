import { create } from 'zustand';

export type UploadStatus = 'uploading' | 'processing' | 'success' | 'error';

export interface UploadItem {
  id: string;
  file?: File;
  filename: string;
  folderId?: string | null;
  progress: number;
  status: UploadStatus;
  errorMessage?: string;
  type?: 'upload' | 'delete' | 'deprecate' | 'restore';
}

interface UploadStore {
  uploads: UploadItem[];
  isMinimized: boolean;
  addUpload: (upload: UploadItem) => void;
  updateProgress: (id: string, progress: number) => void;
  updateStatus: (id: string, status: UploadStatus, errorMessage?: string) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
  toggleMinimized: () => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  uploads: [],
  isMinimized: false,
  
  addUpload: (upload) => 
    set((state) => ({ 
      uploads: [upload, ...state.uploads],
      isMinimized: false // Auto-open when new upload starts
    })),
    
  updateProgress: (id, progress) =>
    set((state) => ({
      uploads: state.uploads.map((u) => 
        u.id === id ? { ...u, progress } : u
      )
    })),
    
  updateStatus: (id, status, errorMessage) =>
    set((state) => ({
      uploads: state.uploads.map((u) => 
        u.id === id ? { ...u, status, errorMessage } : u
      )
    })),
    
  removeUpload: (id) =>
    set((state) => ({
      uploads: state.uploads.filter((u) => u.id !== id)
    })),
    
  clearCompleted: () =>
    set((state) => ({
      uploads: state.uploads.filter((u) => u.status !== 'success' && u.status !== 'error')
    })),
    
  toggleMinimized: () =>
    set((state) => ({ isMinimized: !state.isMinimized }))
}));

import { documentApi } from '../api/document-api';

export const triggerUpload = async (
  uploadId: string, 
  file: File, 
  folderId: string | null | undefined, 
  queryClient: any
) => {
  const store = useUploadStore.getState();
  
  try {
    // 1. Upload to API Gateway (returns 200 or 202)
    const response = await documentApi.uploadDocument(
      file, 
      folderId, 
      null, 
      (p) => store.updateProgress(uploadId, p)
    );
    
    const documentId = response.document_id;
    if (!documentId) {
      store.updateStatus(uploadId, 'success');
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      return;
    }

    // 2. Upload done, now waiting for Ingestion Worker (Processing)
    store.updateStatus(uploadId, 'processing');
    store.updateProgress(uploadId, 30); // Start processing at 30%
    
    // Simulate ingestion progress dynamically up to 95%
    let simulatedProgress = 30;
    const progressInterval = setInterval(() => {
      if (simulatedProgress < 95) {
        // Slow down the increment as it gets closer to 95%
        const increment = Math.max(1, Math.floor((95 - simulatedProgress) / 10));
        simulatedProgress += increment;
        store.updateProgress(uploadId, simulatedProgress);
      }
    }, 1500);

    // 3. Poll to verify actual status from backend
    let count = 0;
    const interval = setInterval(async () => {
      try {
        const doc = await documentApi.getDocumentByID(documentId);
        queryClient.invalidateQueries({ queryKey: ["documents"] });
        queryClient.invalidateQueries({ queryKey: ["folders"] });
        
        if (doc.status === "COMPLETED") {
          clearInterval(interval);
          clearInterval(progressInterval);
          store.updateProgress(uploadId, 100);
          store.updateStatus(uploadId, 'success');
        } else if (doc.status === "FAILED") {
          clearInterval(interval);
          clearInterval(progressInterval);
          store.updateStatus(uploadId, 'error', "Proses ingestion gagal");
        }
        
        count++;
        // Timeout polling after 60s
        if (count > 30) {
          clearInterval(interval);
          clearInterval(progressInterval);
          // If still pending, just keep it processing or assume success (backend will handle it)
          store.updateStatus(uploadId, 'success'); 
        }
      } catch (err) {
        console.error("Error polling document status", err);
      }
    }, 2000);
    
  } catch (error: any) {
    console.error("Upload failed", error);
    store.updateStatus(uploadId, 'error', error?.response?.data?.error || "Gagal mengunggah dokumen");
  }
};
