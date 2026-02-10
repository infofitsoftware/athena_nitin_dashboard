import { useState } from 'react';
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
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Search,
  Clear,
  Download,
  Assessment,
  Business,
  Person,
  LocalHospital,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { biApi } from '../api/bi';
import type { BIQueryResponse } from '../api/bi';
import DataTable from '../components/tables/DataTable';

type ViewMode = 'tenant' | 'practitioner' | 'patient';

/**
 * Service Usage Page
 * Patient service analytics - volume by tenant and practitioner
 */
export default function ServiceUsagePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BIQueryResponse | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('tenant');

  // Filters
  const [tenantId, setTenantId] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [limit, setLimit] = useState(100);

  // Summary metrics
  const [summaryMetrics, setSummaryMetrics] = useState<{
    totalSessions: number;
    uniquePatients: number;
    activePractitioners: number;
    totalAudioHours: number;
  } | null>(null);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start date and end date');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setSummaryMetrics(null);

    const params = {
      tenant_id: tenantId.trim() || undefined,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      limit: limit,
    };

    try {
      let queryType: 'service_usage_tenant' | 'service_usage_practitioner' | 'service_usage_patient';
      switch (viewMode) {
        case 'practitioner':
          queryType = 'service_usage_practitioner';
          break;
        case 'patient':
          queryType = 'service_usage_patient';
          break;
        default:
          queryType = 'service_usage_tenant';
      }

      const result = await biApi.executeQuery({ query_type: queryType, ...params });
      setResults(result);

      // Calculate summary from results
      if (result.results && result.results.length > 0) {
        if (viewMode === 'tenant') {
          const totals = result.results.reduce(
            (acc, row) => ({
              totalSessions: acc.totalSessions + (Number(row.total_sessions) || 0),
              uniquePatients: acc.uniquePatients + (Number(row.unique_patients) || 0),
              activePractitioners: acc.activePractitioners + (Number(row.active_practitioners) || 0),
              totalAudioHours: acc.totalAudioHours + (Number(row.total_audio_duration_seconds) || 0),
            }),
            { totalSessions: 0, uniquePatients: 0, activePractitioners: 0, totalAudioHours: 0 }
          );
          totals.totalAudioHours = Math.round(totals.totalAudioHours / 3600);
          setSummaryMetrics(totals);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load service usage data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTenantId('');
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 30)));
    setEndDate(new Date());
    setLimit(100);
    setError(null);
    setResults(null);
    setSummaryMetrics(null);
  };

  const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: ViewMode | null) => {
    if (newView !== null) {
      setViewMode(newView);
      setResults(null);
      setSummaryMetrics(null);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Assessment color="primary" sx={{ fontSize: 32 }} />
            <Typography component="h1" variant="h4" sx={{ fontWeight: 600 }}>
              Service Usage
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Patient service analytics. View volume by tenant, practitioner, and patient.
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filters
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              size="small"
            >
              <ToggleButton value="tenant">
                <Business sx={{ mr: 0.5, fontSize: 18 }} /> By Tenant
              </ToggleButton>
              <ToggleButton value="practitioner">
                <Person sx={{ mr: 0.5, fontSize: 18 }} /> By Practitioner
              </ToggleButton>
              <ToggleButton value="patient">
                <LocalHospital sx={{ mr: 0.5, fontSize: 18 }} /> By Patient
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
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
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Limit"
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 100)}
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
                  {loading ? 'Loading...' : 'Search'}
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
                    onClick={() => alert('Export functionality coming soon')}
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

        {/* Summary KPI Cards (Tenant view only) */}
        {summaryMetrics && viewMode === 'tenant' && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ borderLeft: 4, borderColor: 'primary.main' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Sessions
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {summaryMetrics.totalSessions.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ borderLeft: 4, borderColor: 'secondary.main' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Unique Patients
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {summaryMetrics.uniquePatients.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ borderLeft: 4, borderColor: 'success.main' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Practitioners
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {summaryMetrics.activePractitioners.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ borderLeft: 4, borderColor: 'warning.main' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Audio Hours
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {summaryMetrics.totalAudioHours.toLocaleString()}h
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Results Table */}
        {results && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Usage by {viewMode === 'tenant' ? 'Tenant' : viewMode === 'practitioner' ? 'Practitioner' : 'Patient'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip label={`${results.row_count} records`} color="primary" size="small" />
                <Chip label={`${(results.execution_time_ms / 1000).toFixed(2)}s`} size="small" />
              </Box>
            </Box>

            {results.results && results.results.length > 0 ? (
              <DataTable data={results.results} columns={results.columns} />
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No usage data found for the selected filters.
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {!results && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Assessment sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              Select a view mode and click "Search" to load service usage analytics.
            </Typography>
          </Paper>
        )}
      </Container>
    </LocalizationProvider>
  );
}
