import { Box, Chip, IconButton, Typography } from '@mui/material';
import { Clear, Refresh } from '@mui/icons-material';

interface FilterIndicatorProps {
  dateRange?: { start: string; end: string } | null;
  tenantId?: string | null;
  recordCount?: number | null;
  lastRefreshed?: string | null;
  onClearFilter?: (filterType: 'date' | 'tenant' | 'all') => void;
  onRefresh?: () => void;
}

/**
 * Visual indicator showing active filters
 * Displays badges for each active filter with clear buttons
 */
export default function FilterIndicator({
  dateRange,
  tenantId,
  recordCount,
  lastRefreshed,
  onClearFilter,
  onRefresh,
}: FilterIndicatorProps) {
  const hasFilters = dateRange || tenantId;

  if (!hasFilters && !recordCount && !lastRefreshed) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
        p: 2,
        mb: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
        Active Filters:
      </Typography>

      {dateRange && (
        <Chip
          label={`${dateRange.start} to ${dateRange.end}`}
          size="small"
          onDelete={onClearFilter ? () => onClearFilter('date') : undefined}
          deleteIcon={<Clear />}
          color="primary"
          variant="outlined"
        />
      )}

      {tenantId && (
        <Chip
          label={`Tenant: ${tenantId}`}
          size="small"
          onDelete={onClearFilter ? () => onClearFilter('tenant') : undefined}
          deleteIcon={<Clear />}
          color="secondary"
          variant="outlined"
        />
      )}

      {recordCount !== null && recordCount !== undefined && (
        <Chip
          label={`${recordCount.toLocaleString()} records`}
          size="small"
          color="info"
          variant="outlined"
        />
      )}

      {lastRefreshed && (
        <Chip
          label={`Last updated: ${lastRefreshed}`}
          size="small"
          variant="outlined"
        />
      )}

      {onClearFilter && hasFilters && (
        <IconButton
          size="small"
          onClick={() => onClearFilter('all')}
          sx={{ ml: 'auto' }}
          title="Clear all filters"
        >
          <Clear fontSize="small" />
        </IconButton>
      )}

      {onRefresh && (
        <IconButton
          size="small"
          onClick={onRefresh}
          title="Refresh data"
        >
          <Refresh fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
