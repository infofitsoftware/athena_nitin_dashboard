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
  Divider,
} from '@mui/material';
import {
  Search,
  Clear,
  Download,
  TrendingUp,
  TrendingDown,
  CalendarMonth,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { biApi } from '../api/bi';
import type { BIQueryResponse } from '../api/bi';
import DataTable from '../components/tables/DataTable';

/**
 * Weekly Summary Page
 * Week-over-week usage trends and aggregated metrics
 */
export default function WeeklySummaryPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BIQueryResponse | null>(null);

  // Filters
  const [tenantId, setTenantId] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 90))
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  // Trend metrics computed from results
  const [trendMetrics, setTrendMetrics] = useState<{
    currentWeekSessions: number;
    previousWeekSessions: number;
    changePercent: number;
    totalWeeks: number;
  } | null>(null);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start date and end date');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setTrendMetrics(null);

    try {
      const result = await biApi.executeQuery({
        query_type: 'weekly_summary',
        tenant_id: tenantId.trim() || undefined,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });

      setResults(result);

      // Compute trend from the first two weeks (most recent first)
      if (result.results && result.results.length >= 2) {
        const current = Number(result.results[0].session_count) || 0;
        const previous = Number(result.results[1].session_count) || 0;
        const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
        setTrendMetrics({
          currentWeekSessions: current,
          previousWeekSessions: previous,
          changePercent: Math.round(change * 100) / 100,
          totalWeeks: result.results.length,
        });
      } else if (result.results && result.results.length === 1) {
        setTrendMetrics({
          currentWeekSessions: Number(result.results[0].session_count) || 0,
          previousWeekSessions: 0,
          changePercent: 0,
          totalWeeks: 1,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load weekly summary';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTenantId('');
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 90)));
    setEndDate(new Date());
    setError(null);
    setResults(null);
    setTrendMetrics(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <CalendarMonth color="primary" sx={{ fontSize: 32 }} />
            <Typography component="h1" variant="h4" sx={{ fontWeight: 600 }}>
              Weekly Summary
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Week-over-week usage trends and aggregated metrics. Default range is 90 days.
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
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
                helperText="Leave empty for cross-tenant summary"
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

        {/* Trend KPI Cards */}
        {trendMetrics && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ borderLeft: 4, borderColor: 'primary.main' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Latest Week Sessions
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {trendMetrics.currentWeekSessions.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ borderLeft: 4, borderColor: 'secondary.main' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Previous Week Sessions
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {trendMetrics.previousWeekSessions.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ borderLeft: 4, borderColor: trendMetrics.changePercent >= 0 ? 'success.main' : 'error.main' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Week-over-Week Change
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {trendMetrics.changePercent >= 0 ? (
                      <TrendingUp color="success" />
                    ) : (
                      <TrendingDown color="error" />
                    )}
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: trendMetrics.changePercent >= 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      {trendMetrics.changePercent > 0 ? '+' : ''}{trendMetrics.changePercent}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2} sx={{ borderLeft: 4, borderColor: 'info.main' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Weeks in Range
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {trendMetrics.totalWeeks}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Week-by-Week Breakdown */}
        {results && results.results && results.results.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Week-by-Week Breakdown
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {results.results.map((week, index) => {
                const prevWeek = index < results.results.length - 1 ? results.results[index + 1] : null;
                const currentSessions = Number(week.session_count) || 0;
                const prevSessions = prevWeek ? Number(prevWeek.session_count) || 0 : 0;
                const change = prevSessions > 0 ? ((currentSessions - prevSessions) / prevSessions) * 100 : 0;
                const audioHours = Math.round((Number(week.total_audio_duration_seconds) || 0) / 3600);

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
                        Week of {String(week.week_start).split('T')[0]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {week.active_users} users &bull; {week.unique_patients} patients
                        {week.active_tenants ? ` \u2022 ${week.active_tenants} tenants` : ''}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {currentSessions.toLocaleString()} sessions
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {audioHours}h audio
                        </Typography>
                      </Box>
                      {prevWeek && (
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

        {/* Raw Data Table */}
        {results && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Raw Weekly Data
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip label={`${results.row_count} weeks`} color="primary" size="small" />
                <Chip label={`${(results.execution_time_ms / 1000).toFixed(2)}s`} size="small" />
              </Box>
            </Box>
            <DataTable data={results.results} columns={results.columns} />
          </Paper>
        )}

        {!results && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CalendarMonth sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              Select filters and click "Search" to view weekly usage trends.
            </Typography>
          </Paper>
        )}
      </Container>
    </LocalizationProvider>
  );
}
