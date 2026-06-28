import { apiClient } from "@/lib/api-client";

export interface UserCost {
  user_id: string;
  email: string;
  name: string;
  total_cost: number;
}

export interface DailyUsage {
  date: string;
  total_tokens: number;
  cost_usd: number;
}

export interface DocStatusDist {
  status: string;
  count: number;
}

export interface UserRoleDist {
  role: string;
  count: number;
}

export interface DashboardMetrics {
  total_cost_this_month: number;
  top_users: UserCost[];
  daily_trend: DailyUsage[];
  total_users: number;
  total_documents: number;
  total_folders: number;
  doc_status_dist: DocStatusDist[];
  user_role_dist: UserRoleDist[];
}

export interface MyMetrics {
  user_id: string;
  total_cost_this_month: number;
}

export interface RiskHeatmap {
  business_unit: string;
  document_type: string;
  risk_level: string;
  count: number;
}

export interface ExpiringContract {
  id: string;
  filename: string;
  document_type: string;
  risk_level: string;
  vendor_name: string;
  expiry_date: string;
}



export const metricsApi = {
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const res = await apiClient.get('/metrics/tokens');
    return res.data;
  },
  
  getMyMetrics: async (): Promise<MyMetrics> => {
    const res = await apiClient.get('/metrics/tokens/me');
    return res.data;
  },

  getRiskHeatmap: async (): Promise<RiskHeatmap[]> => {
    const res = await apiClient.get('/metrics/risk-heatmap');
    return res.data;
  },

  getExpiringContracts: async (): Promise<ExpiringContract[]> => {
    const res = await apiClient.get('/metrics/expiring-contracts');
    return res.data;
  }
};
