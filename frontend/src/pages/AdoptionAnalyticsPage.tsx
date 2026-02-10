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
  Divider,
} from '@mui/material';
import {
  Search,
  Clear,
  Download,
  Insights,
  TrendingUp,
  TrendingDown,
  People,
  ShowChart,
  CalendarMonth,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { biApi } from '../api/bi';
import type { BIQueryResponse } from '../api/bi';
import DataTable from '../components/tables/DataTable';

type ViewMode = 'growth' | 'dau' | 'mau';

/**
 * Adoption Analytics Page
 * User retention metrics, daily/monthly active users, and growth trends
 */
export default function AdoptionAnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BIQueryResponse | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('growth');

  // Filters
  const [tenantId, setTenantId] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setMonth(new Date().getMonth() - 6))
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  // Growth summary
  const [growthSummary, setGrowthSummary] = useState<{
    latestMonth: Record<string, any>;
    previousMonth: Record<string, any>;
    sessionChange: number;
    userChange: number;
  } | null>(null);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start date and end date');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setGrowthSummary(null);

    const params = {
      tenant_id: tenantId.trim() || undefined,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    };

    try {
      let queryType: 'growth_metrics' | 'daily_active_users' | 'monthly_active_users';
      switch (viewMode) {
        case 'dau':
          queryType = 'daily_active_users';
          break;
        case 'mau':
          queryType = 'monthly_active_users';
          break;
        default:
          queryType = 'growth_metrics';
      }

      const result = await biApi.executeQuery({ query_type: queryType, ...params });
      setResults(result);

      // Compute growth summary for growth_metrics view
      if (viewMode === 'growth' && result.results && result.results.length >= 2) {
        const latest = result.results[result.results.length - 1];
        const previous = result.results[result.results.length - 2];
        const sessionChange = Number(previous.sessions) > 0
          ? ((Number(latest.sessions) - Number(previous.sessions)) / Number(previous.sessions)) * 100
          : 0;
        const userChange = Number(previous.users) > 0
          ? ((Number(latest.users) - Number(previous.users)) / Number(previous.users)) * 100
          : 0;
        setGrowthSummary({
          latestMonth: latest,
          previousMonth: previous,
          sessionChange: Math.round(sessionChange * 100) / 100,
          userChange: Math.round(userChange * 100) / 100,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load adoption analytics';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTenantId('');
    setStartDate(new Date(new Date().setMonth(new Date().getMonth() - 6)));
    setEndDate(new Date());
    setError(null);
    setResults(null);
    setGrowthSummary(null);
  };

  const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: ViewMode | null) => {
    if (newView !== null) {
      setViewMode(newView);
      setResults(null);
      setGrowthSummary(null);
    }
  };

  const getViewTitle = () => {
    switch (viewMode) {
      case 'dau': return 'Daily Active Users';
      case 'mau': return 'Monthly Active Users';
      default: return 'Monthly Growth Metrics';
    }
  };

  const getViewDescription = () => {
    switch (viewMode) {
      case 'dau': return 'Number of unique users active each day';
      case 'mau': return 'Number of unique users active each month';
      default: return 'Monthly growth in sessions, users, patients, and tenants';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Insights color="primary" sx={{ fontSize: 32 }} />
            <Typography component="h1" variant="h4" sx={{ fontWeight: 600 }}>
              Adoption Analytics
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Track platform adoption with growth metrics, daily active users (DAU), and monthly active users (MAU).
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filters
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              size="small"
            >
              <ToggleButton value="growth">
                <TrendingUp sx={{ mr: 0.5, fontSize: 18 }} /> Growth
              </ToggleButton>
              <ToggleButton value="dau">
                <ShowChart sx={{ mr: 0.5, fontSize: 18 }} /> DAU
              </ToggleButton>
              <ToggleButton value="mau">
                <CalendarMonth sx={{ mr: 0.5, fontSize: 18 }} /> MAU
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
                helperText="Leave empty for platform-wide analytics"
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
                  {loading ? 'Loading...' : 'Analyze'}
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

        {/* Growth Summary Cards */}
        {growthSummary && viewMode === 'growth' && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ borderLeft: 4, borderColor: 'primary.main' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Latest Month Sessions
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {Number(growthSummary.latestMonth.sessions || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {String(growthSummary.latestMonth.month || '').split('T')[0]}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ borderLeft: 4, borderColor: 'secondary.main' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Latest Month Users
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {Number(growthSummary.latestMonth.users || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Active practitioners
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ borderLeft: 4, borderColor: growthSummary.sessionChange >= 0 ? 'success.main' : 'error.main' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Session Growth (MoM)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {growthSummary.sessionChange >= 0 ? (
                      <TrendingUp color="success" />
                    ) : (
                      <TrendingDown color="error" />
                    )}
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: growthSummary.sessionChange >= 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      {growthSummary.sessionChange > 0 ? '+' : ''}{growthSummary.sessionChange}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ borderLeft: 4, borderColor: growthSummary.userChange >= 0 ? 'success.main' : 'error.main' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    User Growth (MoM)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {growthSummary.userChange >= 0 ? (
                      <TrendingUp color="success" />
                    ) : (
                      <TrendingDown color="error" />
                    )}
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: growthSummary.userChange >= 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      {growthSummary.userChange > 0 ? '+' : ''}{growthSummary.userChange}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Growth Timeline (for growth view) */}
        {results && viewMode === 'growth' && results.results && results.results.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Monthly Growth Timeline
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {results.results.map((month, index) => {
                const prevMonth = index > 0 ? results.results[index - 1] : null;
                const sessions = Number(month.sessions) || 0;
                const prevSessions = prevMonth ? Number(prevMonth.sessions) || 0 : 0;
                const change = prevSessions > 0 ? ((sessions - prevSessions) / prevSessions) * 100 : 0;
                const audioHours = Math.round((Number(month.total_audio_seconds) || 0) / 3600);

                return (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 2,
                      px: 1,
                      borderBottom: index < results.results.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {String(month.month || '').split('T')[0]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {month.users} users &bull; {month.patients} patients &bull; {month.tenants} tenants
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {sessions.toLocaleString()} sessions
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {audioHours}h audio
                        </Typography>
                      </Box>
                      {prevMonth && (
                        <Chip
                          icon={change >= 0 ? <TrendingUp /> : <TrendingDown />}
                          label={`${change > 0 ? '+' : ''}${Math.round(change)}%`}
                          color={change >= 0 ? 'success' : 'error'}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        )}

        {/* Results Table */}
        {results && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {getViewTitle()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getViewDescription()}
                </Typography>
              </Box>
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
                  No data found for the selected filters and date range.
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {!results && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Insights sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              Select a metric view and click "Analyze" to view adoption analytics.
            </Typography>
          </Paper>
        )}
      </Container>
    </LocalizationProvider>
  );
}
