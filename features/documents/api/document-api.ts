import { apiClient } from "@/lib/api-client";

export interface Folder {
  id: string;
  name: string;
  parent_id?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentType {
  id: string;
  folder_id?: string | null;
  filename: string;
  status: string;
  uploaded_by: string;
  file_size_bytes: number;
  is_deprecated: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export const documentApi = {
  // Folders
  getFolders: async (parentId?: string | null) => {
    const params = new URLSearchParams();
    if (parentId !== undefined && parentId !== null) {
      params.append("parent_id", parentId);
    } else if (parentId === null) {
      params.append("parent_id", "null");
    }
    const res = await apiClient.get(`/folders?${params.toString()}`);
    return res.data.data as Folder[];
  },
  getFolderByID: async (id: string) => {
    const res = await apiClient.get(`/folders/${id}`);
    return res.data as Folder;
  },
  getFolderPath: async (id: string) => {
    const res = await apiClient.get(`/folders/${id}/path`);
    return res.data.data as Folder[];
  },
  createFolder: async (name: string, parentId?: string | null) => {
    const res = await apiClient.post("/folders", { name, parent_id: parentId });
    return res.data;
  },
  renameFolder: async (id: string, name: string) => {
    const res = await apiClient.put(`/folders/${id}`, { name });
    return res.data;
  },
  moveFolder: async (id: string, parentId?: string | null) => {
    const res = await apiClient.put(`/folders/${id}/move`, { parent_id: parentId });
    return res.data;
  },
  deleteFolder: async (id: string) => {
    const res = await apiClient.delete(`/folders/${id}`);
    return res.data;
  },

  // Documents
  getDocuments: async (folderId?: string | null) => {
    const params = new URLSearchParams();
    if (folderId !== undefined && folderId !== null) {
      params.append("folder_id", folderId);
    } else if (folderId === null) {
      params.append("folder_id", "null");
    }
    const res = await apiClient.get(`/documents?${params.toString()}`);
    return res.data.data as DocumentType[]; // Assuming backend returns { data: [...] }
  },
  renameDocument: async (id: string, name: string) => {
    const res = await apiClient.put(`/documents/${id}/rename`, { name });
    return res.data;
  },
  moveDocument: async (id: string, folderId?: string | null) => {
    const res = await apiClient.put(`/documents/${id}/move`, { folder_id: folderId });
    return res.data;
  },
  deleteDocument: async (id: string) => {
    const res = await apiClient.delete(`/documents/${id}`);
    return res.data;
  },
  deprecateDocument: async (id: string) => {
    const res = await apiClient.post(`/documents/${id}/deprecate`);
    return res.data;
  },
  uploadDocument: async (file: File, folderId?: string | null, replacesId?: string | null) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) formData.append("folder_id", folderId);
    if (replacesId) formData.append("replaces_document_id", replacesId);

    const res = await apiClient.post("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};
