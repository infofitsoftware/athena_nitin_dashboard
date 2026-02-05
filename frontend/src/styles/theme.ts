import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

/**
 * Material-UI theme configuration
 * Healthcare-appropriate, professional design system
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    background: colors.background,
    text: colors.text,
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '32px',
      lineHeight: '40px',
      fontWeight: 600,
    },
    h2: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: 600,
    },
    h3: {
      fontSize: '20px',
      lineHeight: '28px',
      fontWeight: 600,
    },
    h4: {
      fontSize: '18px',
      lineHeight: '24px',
      fontWeight: 600,
    },
    body1: {
      fontSize: '14px',
      lineHeight: '20px',
    },
    body2: {
      fontSize: '12px',
      lineHeight: '16px',
    },
  },
  spacing: 8, // 8px base unit
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});
