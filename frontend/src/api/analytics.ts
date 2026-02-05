import apiClient from './client';

export type QueryRequest = {
  query: string;
  database?: string;
  limit?: number;
};

export type QueryResponse = {
  query_execution_id: string;
  status: string;
  data_scanned_bytes: number;
  execution_time_ms: number;
  row_count: number;
  columns: string[];
  results: Record<string, any>[];
};

/**
 * Analytics API calls
 */
export const analyticsApi = {
  /**
   * Execute an Athena query
   */
  executeQuery: async (request: QueryRequest): Promise<QueryResponse> => {
    const response = await apiClient.post<QueryResponse>(
      '/api/v1/analytics/query',
      request
    );
    return response.data;
  },
};
