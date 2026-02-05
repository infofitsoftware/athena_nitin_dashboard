/**
 * Analytics types
 */

export interface QueryResult {
  query_execution_id: string;
  status: string;
  data_scanned_bytes: number;
  execution_time_ms: number;
  row_count: number;
  columns: string[];
  results: Record<string, any>[];
}
