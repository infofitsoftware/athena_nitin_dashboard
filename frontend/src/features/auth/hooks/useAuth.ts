import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/auth';
import type { LoginRequest } from '../../../api/auth';
import { useAuthStore } from '../../../store/authStore';

/**
 * Custom hook for authentication
 */
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser, setToken, logout: logoutStore } = useAuthStore();

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(credentials);
      
      // Store token and user
      setToken(response.access_token);
      setUser(response.user);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutStore();
    navigate('/login');
  };

  return {
    login,
    logout,
    loading,
    error,
  };
}
