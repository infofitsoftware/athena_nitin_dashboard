import apiClient from './client';

export type LoginRequest = {
  username: string;
  password: string;
};

export type User = {
  username: string;
  email: string;
  role: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

/**
 * Authentication API calls
 */
export const authApi = {
  /**
   * Login with username and password
   */
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>(
      '/api/v1/auth/login',
      credentials
    );
    return response.data;
  },
};
