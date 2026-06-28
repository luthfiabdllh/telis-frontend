import { apiClient } from "@/lib/api-client";

export interface Folder {
  id: string;
  name: string;
  parent_id?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  folder_path?: string;
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
  folder_path?: string;
  document_type?: string;
  risk_level?: string;
  risk_reasoning?: string;
  vendor_name?: string;
  business_unit?: string;
  effective_date?: string;
  expiry_date?: string;
  summary?: string;
}

export interface MetadataOptions {
  vendors: string[];
  business_units: string[];
}

export interface ApprovalWorkflow {
  id: string;
  document_id: string;
  requester_id: string;
  approver_id: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const documentApi = {
  // Folders
  getFolders: async (parentId?: string | null, search?: string, isGlobal?: boolean) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (isGlobal) {
      params.append("is_global", "true");
    } else if (parentId !== undefined && parentId !== null) {
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
  getDocuments: async (
    folderId?: string | null, 
    search?: string, 
    isGlobal?: boolean, 
    documentType?: string,
    riskLevel?: string,
    vendorName?: string,
    businessUnit?: string,
    sortBy?: string,
    sortOrder?: string
  ) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (documentType && documentType !== "ALL") params.append("document_type", documentType);
    if (riskLevel && riskLevel !== "ALL") params.append("risk_level", riskLevel);
    if (vendorName) params.append("vendor_name", vendorName);
    if (businessUnit) params.append("business_unit", businessUnit);
    if (sortBy) params.append("sort_by", sortBy);
    if (sortOrder) params.append("sort_order", sortOrder);
    
    if (isGlobal) {
      params.append("is_global", "true");
    } else if (folderId !== undefined && folderId !== null) {
      params.append("folder_id", folderId);
    } else if (folderId === null) {
      params.append("folder_id", "null");
    }
    params.append("_t", Date.now().toString()); // Cache-buster
    const res = await apiClient.get(`/documents?${params.toString()}`);
    return res.data.data as DocumentType[]; // Assuming backend returns { data: [...] }
  },
  getDocumentByID: async (id: string) => {
    const res = await apiClient.get(`/documents/${id}`);
    return res.data as DocumentType;
  },
  getMetadataOptions: async () => {
    const res = await apiClient.get(`/documents/metadata-options`);
    return res.data as MetadataOptions;
  },
  updateMetadata: async (id: string, metadata: Partial<DocumentType>) => {
    const res = await apiClient.patch(`/documents/${id}/metadata`, metadata);
    return res.data;
  },
  summarizeDocument: async (id: string, force?: boolean) => {
    const res = await apiClient.get(`/documents/${id}/summarize${force ? '?force=true' : ''}`);
    return res.data;
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
  restoreDocument: async (id: string) => {
    const res = await apiClient.post(`/documents/${id}/restore`);
    return res.data;
  },
  uploadDocument: async (
    file: File, 
    folderId?: string | null, 
    replacesId?: string | null,
    onProgress?: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) formData.append("folder_id", folderId);
    if (replacesId) formData.append("replaces_document_id", replacesId);

    const res = await apiClient.post("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return res.data;
  },
  downloadFileBlob: async (id: string) => {
    const res = await apiClient.get(`/documents/${id}/download?view=true`, {
      responseType: "blob",
    });
    return res.data;
  },
  searchDrive: async (
    query: string, 
    folderId?: string | null, 
    isGlobal: boolean = false,
    documentType?: string,
    riskLevel?: string,
    vendorName?: string,
    businessUnit?: string,
    sortBy?: string,
    sortOrder?: string
  ) => {
    if (!query && !documentType && !riskLevel && !vendorName && !businessUnit) return { folders: [], documents: [] };
    
    const folderParams = new URLSearchParams();
    if (query) folderParams.append("search", query);
    if (isGlobal) {
      folderParams.append("is_global", "true");
    } else if (folderId) {
      folderParams.append("parent_id", folderId);
    } else if (folderId === null) {
      folderParams.append("parent_id", "null");
    }

    const docParams = new URLSearchParams();
    if (query) docParams.append("search", query);
    if (documentType && documentType !== "ALL") docParams.append("document_type", documentType);
    if (riskLevel && riskLevel !== "ALL") docParams.append("risk_level", riskLevel);
    if (vendorName && vendorName !== "ALL") docParams.append("vendor_name", vendorName);
    if (businessUnit && businessUnit !== "ALL") docParams.append("business_unit", businessUnit);
    if (sortBy) docParams.append("sort_by", sortBy);
    if (sortOrder) docParams.append("sort_order", sortOrder);

    if (isGlobal) {
      docParams.append("is_global", "true");
    } else if (folderId !== undefined && folderId !== null) {
      docParams.append("folder_id", folderId);
    } else if (folderId === null) {
      docParams.append("folder_id", "null");
    }
    docParams.append("_t", Date.now().toString());

    const [folderRes, docRes] = await Promise.all([
      apiClient.get(`/folders?${folderParams.toString()}`),
      apiClient.get(`/documents?${docParams.toString()}`)
    ]);

    return {
      folders: folderRes.data.data as Folder[] || [],
      documents: docRes.data.data as DocumentType[] || [],
    };
  },
  
  // Approvals
  requestApproval: async (id: string, approverId: string, notes: string) => {
    const res = await apiClient.post(`/documents/${id}/approvals`, {
      approver_id: approverId,
      notes: notes,
    });
    return res.data as ApprovalWorkflow;
  },
  reviewApproval: async (id: string, approvalId: string, status: string, notes: string) => {
    const res = await apiClient.put(`/documents/${id}/approvals/${approvalId}`, {
      status: status,
      notes: notes,
    });
    return res.data;
  },
  getDocumentApprovals: async (id: string) => {
    const res = await apiClient.get(`/documents/${id}/approvals`);
    return res.data as ApprovalWorkflow[];
  }
};
