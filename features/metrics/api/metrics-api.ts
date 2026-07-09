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

export interface RecentActivity {
  id: number;
  type: string;
  title: string;
  tokens: number;
  cost: number;
  timestamp: string;
  input_tokens?: number;
  output_tokens?: number;
}

export interface FeatureUsageDist {
  feature: string;
  cost_usd: number;
  tokens: number;
}

export interface MyMetrics {
  total_cost_this_month: number;
  daily_trend: DailyUsage[];
  recent_activities: RecentActivity[];
  feature_usage_dist?: FeatureUsageDist[];
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
  getDashboardMetrics: async (params?: { start_date?: string; end_date?: string }): Promise<DashboardMetrics> => {
    const res = await apiClient.get('/metrics/tokens', { params });
    return res.data;
  },
  
  getMyMetrics: async (params?: { start_date?: string; end_date?: string }): Promise<MyMetrics> => {
    const res = await apiClient.get('/metrics/tokens/me', { params });
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
