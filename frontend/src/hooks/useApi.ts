import { useCallback } from 'react';
import apiClient from '../api/client';
import { ApiResponse, ApiError } from '../types/api';

/**
 * Custom hook for API calls
 * Will be enhanced in later phases
 */
export function useApi() {
  const get = useCallback(async <T>(url: string): Promise<T> => {
    const response = await apiClient.get<ApiResponse<T>>(url);
    return response.data.data;
  }, []);

  const post = useCallback(async <T>(url: string, data?: unknown): Promise<T> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data);
    return response.data.data;
  }, []);

  return { get, post };
}
