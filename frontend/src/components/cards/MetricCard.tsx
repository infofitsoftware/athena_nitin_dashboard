import { Card, CardContent, Box, Typography, Tooltip, IconButton } from '@mui/material';
import { TrendingUp, TrendingDown, Remove, HelpOutline } from '@mui/icons-material';

interface MetricCardProps {
  label: string;
  value: number | string;
  change?: number; // Percentage change
  trend?: 'up' | 'down' | 'neutral';
  unit?: string;
  subtext?: string;
  helper?: string;
  precision?: number;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  borderColor?: string;
}

/**
 * Enhanced KPI card with trend indicators
 * Shows value, percentage change, and trend arrow
 */
export default function MetricCard({
  label,
  value,
  change = 0,
  trend = 'neutral',
  unit = '',
  subtext,
  helper,
  precision,
  color = 'primary',
  borderColor,
}: MetricCardProps) {
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;
    if (precision !== undefined) {
      return val.toFixed(precision);
    }
    return val.toLocaleString();
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp color="success" sx={{ fontSize: 20 }} />;
      case 'down':
        return <TrendingDown color="error" sx={{ fontSize: 20 }} />;
      default:
        return <Remove color="disabled" sx={{ fontSize: 20 }} />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const displayChange = change !== 0 && trend !== 'neutral';

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        borderLeft: borderColor ? `4px solid ${borderColor}` : `4px solid`,
        borderLeftColor: `${color}.main`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
            {helper && (
              <Tooltip title={helper} arrow>
                <IconButton size="small" sx={{ p: 0, ml: 0.5 }}>
                  <HelpOutline fontSize="small" color="action" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {displayChange && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {getTrendIcon()}
              <Typography
                variant="body2"
                sx={{
                  color: getTrendColor(),
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {change > 0 ? '+' : ''}
                {change.toFixed(1)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: subtext ? 0.5 : 0,
            color: `${color}.main`,
          }}
        >
          {formatValue(value)}
          {unit && (
            <Typography component="span" variant="body2" sx={{ ml: 0.5, fontWeight: 400 }}>
              {unit}
            </Typography>
          )}
        </Typography>
        {subtext && (
          <Typography variant="caption" color="text.secondary">
            {subtext}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
