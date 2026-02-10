import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Search, Clear, Download } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { biApi } from '../api/bi';
import type { BIQueryResponse } from '../api/bi';
import DataTable from '../components/tables/DataTable';

/**
 * Audit Trail Page
 * Detailed event log for compliance and tracking
 * Shows all clinical documentation events with filtering capabilities
 */
export default function AuditTrailPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BIQueryResponse | null>(null);
  
  // Filters
  const [tenantId, setTenantId] = useState('');
  const [userId, setUserId] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [limit, setLimit] = useState(1000);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start date and end date');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const result = await biApi.executeQuery({
        query_type: 'audit_trail',
        tenant_id: tenantId.trim() || undefined,
        user_id: userId.trim() || undefined,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        limit: limit,
      });

      setResults(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load audit trail';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTenantId('');
    setUserId('');
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 30)));
    setEndDate(new Date());
    setLimit(1000);
    setError(null);
    setResults(null);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SIGNED':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'IN_PROGRESS':
        return 'warning';
      case 'UNSIGNED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Audit Trail
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Detailed event log for compliance and tracking. View all clinical documentation events with filtering.
        </Typography>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tenant ID (optional)"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="e.g., VOANR_WY:PROD"
                size="small"
                helperText="Leave empty to see all tenants"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="User ID (optional)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Filter by practitioner"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Limit"
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 1000)}
                inputProps={{ min: 1, max: 10000 }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Start Date *"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="End Date *"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                  onClick={handleSearch}
                  disabled={loading || !startDate || !endDate}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={handleClear}
                  disabled={loading}
                >
                  Clear
                </Button>
                {results && (
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={() => {
                      // TODO: Implement CSV export
                      alert('Export functionality coming soon');
                    }}
                  >
                    Export CSV
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Results */}
        {results && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Audit Trail Results
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  label={`${results.row_count} records`}
                  color="primary"
                  size="small"
                />
                <Chip
                  label={`${(results.execution_time_ms / 1000).toFixed(2)}s`}
                  size="small"
                />
              </Box>
            </Box>

            {results.results && results.results.length > 0 ? (
              <DataTable
                data={results.results.map((row) => ({
                  ...row,
                  status_chip: row.status, // Keep status for chip rendering
                }))}
                columns={results.columns}
              />
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No audit trail records found for the selected filters.
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {!results && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Enter filters and click "Search" to view audit trail records.
            </Typography>
          </Paper>
        )}
      </Container>
    </LocalizationProvider>
  );
}
