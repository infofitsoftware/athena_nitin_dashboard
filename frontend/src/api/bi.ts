import apiClient from './client';

export type BIQueryType =
  | 'total_sessions'
  | 'sessions_by_status'
  | 'sessions_trend'
  | 'top_tenants'
  | 'top_practitioners'
  | 'audit_trail'
  | 'unsigned_notes'
  | 'unsigned_notes_count'
  | 'unsigned_notes_by_practitioner'
  | 'weekly_summary'
  | 'weekly_summary_by_tenant'
  | 'daily_active_users'
  | 'monthly_active_users'
  | 'growth_metrics'
  | 'service_usage_tenant'
  | 'service_usage_practitioner'
  | 'service_usage_patient'
  | 'note_format_usage'
  | 'events_by_type';

export type BIQueryRequest = {
  query_type: BIQueryType;
  tenant_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
};

export type BIQueryResponse = {
  query_execution_id: string;
  status: string;
  data_scanned_bytes: number;
  execution_time_ms: number;
  row_count: number;
  columns: string[];
  results: Record<string, any>[];
};

export type AvailableQuery = {
  type: BIQueryType;
  name: string;
  description: string;
  requires_tenant: boolean;
};

/**
 * BI Analytics API calls
 */
export const biApi = {
  /**
   * Execute a pre-built BI query
   */
  executeQuery: async (request: BIQueryRequest): Promise<BIQueryResponse> => {
    const { query_type, ...params } = request;
    const response = await apiClient.get<BIQueryResponse>(
      `/api/v1/bi/query/${query_type}`,
      { params }
    );
    return response.data;
  },

  /**
   * List all available BI queries
   */
  listQueries: async (): Promise<{ queries: AvailableQuery[] }> => {
    const response = await apiClient.get<{ queries: AvailableQuery[] }>(
      '/api/v1/bi/queries'
    );
    return response.data;
  },
};
