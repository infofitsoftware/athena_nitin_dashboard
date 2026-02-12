import { Box, Paper, Typography, Tooltip, IconButton } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import { ReactNode } from 'react';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  tooltip?: string;
  children: ReactNode;
  empty?: boolean;
  emptyMessage?: string;
  height?: number;
}

/**
 * Common wrapper for all charts
 * Provides consistent styling, titles, and empty states
 */
export default function ChartWrapper({
  title,
  subtitle,
  tooltip,
  children,
  empty = false,
  emptyMessage = 'No data available',
  height = 300,
}: ChartWrapperProps) {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: subtitle ? 0.5 : 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {tooltip && (
            <Tooltip title={tooltip} arrow>
              <IconButton size="small" sx={{ p: 0.5 }}>
                <HelpOutline fontSize="small" color="action" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {empty ? (
        <Box
          sx={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
          }}
        >
          <Typography variant="body2">{emptyMessage}</Typography>
        </Box>
      ) : (
        <Box sx={{ height }}>{children}</Box>
      )}
    </Paper>
  );
}
