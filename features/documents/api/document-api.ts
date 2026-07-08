import { apiClient } from "@/lib/api-client";

import {
  Folder,
  DocumentType,
  MetadataOptions,
  ApprovalWorkflow,
  folderSchema,
  documentSchema,
  metadataOptionsSchema,
  approvalWorkflowSchema
} from "../schemas/document-schemas";

function extractArray(data: any): any[] {
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  if (data?.data === null || data === null || data === undefined) return [];
  return data?.data || data;
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
    const payload = extractArray(res.data);
    const parsed = folderSchema.array().safeParse(payload);
    if (!parsed.success) {
      console.error("Zod parse error on getFolders. Raw res.data:", res.data, "Error:", parsed.error);
      return [];
    }
    return parsed.data;
  },
  getFolderByID: async (id: string) => {
    const res = await apiClient.get(`/folders/${id}`);
    const parsed = folderSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error("Zod parse error on getFolderByID:", parsed.error);
      return res.data as Folder;
    }
    return parsed.data;
  },
  getFolderPath: async (id: string) => {
    const res = await apiClient.get(`/folders/${id}/path`);
    const payload = extractArray(res.data);
    const parsed = folderSchema.array().safeParse(payload);
    if (!parsed.success) {
      console.error("Zod parse error on getFolderPath. Raw res.data:", res.data, "Error:", parsed.error);
      return [];
    }
    return parsed.data;
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
    const payload = extractArray(res.data);
    const parsed = documentSchema.array().safeParse(payload);
    if (!parsed.success) {
      console.error("Zod parse error on getDocuments. Raw res.data:", res.data, "Error:", parsed.error);
      return [];
    }
    return parsed.data;
  },
  getDocumentByID: async (id: string) => {
    const res = await apiClient.get(`/documents/${id}`);
    const parsed = documentSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error("Zod parse error on getDocumentByID:", parsed.error);
      return res.data as DocumentType;
    }
    return parsed.data;
  },
  getMetadataOptions: async () => {
    const res = await apiClient.get(`/documents/metadata-options`);
    const parsed = metadataOptionsSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error("Zod parse error on getMetadataOptions:", parsed.error);
      return res.data as MetadataOptions;
    }
    return parsed.data;
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

    const parsedFolders = folderSchema.array().safeParse(extractArray(folderRes.data));
    const parsedDocs = documentSchema.array().safeParse(extractArray(docRes.data));
    
    if (!parsedFolders.success) console.error("Zod parse error on searchDrive folders. Raw data:", folderRes.data, "Error:", parsedFolders.error);
    if (!parsedDocs.success) console.error("Zod parse error on searchDrive documents. Raw data:", docRes.data, "Error:", parsedDocs.error);

    return {
      folders: parsedFolders.success ? parsedFolders.data : [],
      documents: parsedDocs.success ? parsedDocs.data : [],
    };
  },
  
  // Approvals
  requestApproval: async (id: string, approverId: string, notes: string) => {
    const res = await apiClient.post(`/documents/${id}/approvals`, {
      approver_id: approverId,
      notes: notes,
    });
    const parsed = approvalWorkflowSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error("Zod parse error on requestApproval:", parsed.error);
      return res.data as ApprovalWorkflow;
    }
    return parsed.data;
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
    const payload = extractArray(res.data);
    const parsed = approvalWorkflowSchema.array().safeParse(payload);
    if (!parsed.success) {
      console.error("Zod parse error on getDocumentApprovals. Raw res.data:", res.data, "Error:", parsed.error);
      return [];
    }
    return parsed.data;
  }
};
