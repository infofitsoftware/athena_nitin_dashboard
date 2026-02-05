/**
 * Environment configuration
 */
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  appName: 'Athena Dashboard',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  enableDevTools: import.meta.env.DEV,
} as const;
