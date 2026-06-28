import { apiClient } from "@/lib/api-client";

export type RedlineStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface RedlineJob {
  id: string;
  user_id: string;
  source_file_path: string;
  target_file_path: string;
  status: RedlineStatus;
  analysis_result: string;
  created_at: string;
  updated_at: string;
}

export const redlineApi = {
  uploadRedline: async (sourceFile: File, targetFile: File): Promise<{ job_id: string }> => {
    const formData = new FormData();
    formData.append("source_file", sourceFile);
    formData.append("target_file", targetFile);

    // Using multipart/form-data, browser sets the correct boundary automatically
    const res = await apiClient.post("/redlines", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  getRedlineJob: async (jobId: string): Promise<RedlineJob> => {
    const res = await apiClient.get(`/redlines/${jobId}`);
    return res.data;
  },
};
