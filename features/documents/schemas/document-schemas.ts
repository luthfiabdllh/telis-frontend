import * as z from "zod";

// API Response Schemas
export const folderSchema = z.object({
  id: z.string(),
  name: z.string(),
  parent_id: z.string().nullable().optional(),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  folder_path: z.string().optional(),
});

export const documentSchema = z.object({
  id: z.string(),
  folder_id: z.string().nullable().optional(),
  filename: z.string(),
  status: z.string(),
  uploaded_by: z.string(),
  file_size_bytes: z.number(),
  is_deprecated: z.boolean(),
  version: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  folder_path: z.string().optional(),
  document_type: z.string().optional(),
  risk_level: z.string().optional(),
  risk_reasoning: z.string().optional(),
  vendor_name: z.string().optional(),
  business_unit: z.string().optional(),
  effective_date: z.string().optional(),
  expiry_date: z.string().optional(),
  summary: z.string().optional(),
});

export const metadataOptionsSchema = z.object({
  vendors: z.array(z.string()),
  business_units: z.array(z.string()),
});

export const approvalWorkflowSchema = z.object({
  id: z.string(),
  document_id: z.string(),
  requester_id: z.string(),
  approver_id: z.string(),
  status: z.string(),
  notes: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// TypeScript Types inferred from Zod schemas
export type Folder = z.infer<typeof folderSchema>;
export type DocumentType = z.infer<typeof documentSchema>;
export type MetadataOptions = z.infer<typeof metadataOptionsSchema>;
export type ApprovalWorkflow = z.infer<typeof approvalWorkflowSchema>;

// Form Validation Schemas
export const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(100),
});
export type CreateFolderInput = z.infer<typeof createFolderSchema>;

export const renameSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
});
export type RenameInput = z.infer<typeof renameSchema>;

export const uploadDocumentSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, "Document file is required"),
});
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

export const documentMetadataSchema = z.object({
  document_type: z.string().optional(),
  risk_level: z.string().optional(),
  vendor_name: z.string().optional(),
  business_unit: z.string().optional(),
  effective_date: z.string().optional(),
  expiry_date: z.string().optional(),
});
export type DocumentMetadataInput = z.infer<typeof documentMetadataSchema>;
