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
  Warning,
  NoteAdd,
  Person,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { biApi } from '../api/bi';
import type { BIQueryResponse } from '../api/bi';
import DataTable from '../components/tables/DataTable';

/**
 * Unsigned Notes Page
 * Displays notes awaiting practitioner signature
 * Helps identify compliance risks and overdue signatures
 */
export default function UnsignedNotesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BIQueryResponse | null>(null);
  const [countData, setCountData] = useState<number | null>(null);
  const [practitionerData, setPractitionerData] = useState<BIQueryResponse | null>(null);

  // Filters
  const [tenantId, setTenantId] = useState('');
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
    setCountData(null);
    setPractitionerData(null);

    const params = {
      tenant_id: tenantId.trim() || undefined,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      limit: limit,
    };

    try {
      // Fetch all data in parallel
      const [notesResult, countResult, practResult] = await Promise.all([
        biApi.executeQuery({ query_type: 'unsigned_notes', ...params }),
        biApi.executeQuery({ query_type: 'unsigned_notes_count', ...params }),
        biApi.executeQuery({ query_type: 'unsigned_notes_by_practitioner', ...params }),
      ]);

      setResults(notesResult);

      if (countResult.results && countResult.results.length > 0) {
        setCountData(countResult.results[0].unsigned_count || 0);
      }

      setPractitionerData(practResult);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load unsigned notes';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTenantId('');
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 30)));
    setEndDate(new Date());
    setLimit(1000);
    setError(null);
    setResults(null);
    setCountData(null);
    setPractitionerData(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <NoteAdd color="error" sx={{ fontSize: 32 }} />
            <Typography component="h1" variant="h4" sx={{ fontWeight: 600 }}>
              Unsigned Notes
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Notes awaiting practitioner signature. Monitor compliance and identify overdue signatures.
          </Typography>
        </Box>

        {/* Compliance Warning */}
        <Alert severity="warning" icon={<Warning />} sx={{ mb: 3 }}>
          <strong>Compliance Notice:</strong> Unsigned notes may indicate documentation that requires practitioner review and signature.
          Regular monitoring helps ensure timely completion of clinical documentation.
        </Alert>

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
                helperText="Leave empty to see all tenants"
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
                  color="primary"
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

        {/* KPI Cards */}
        {countData !== null && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2} sx={{ borderLeft: 4, borderColor: 'error.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <NoteAdd color="error" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Total Unsigned Notes
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {countData.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Awaiting signature
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2} sx={{ borderLeft: 4, borderColor: 'warning.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person color="warning" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Practitioners with Unsigned Notes
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {practitionerData?.row_count?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Unique practitioners
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2} sx={{ borderLeft: 4, borderColor: 'info.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Warning color="info" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Records Found
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {results?.row_count?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Matching filters
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Practitioner Breakdown */}
        {practitionerData && practitionerData.results && practitionerData.results.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Unsigned Notes by Practitioner
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {practitionerData.results.slice(0, 15).map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    px: 1,
                    borderBottom: index < Math.min(practitionerData.results.length, 15) - 1 ? 1 : 0,
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {item.user_id}
                      </Typography>
                      {item.tenant_id && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {item.tenant_id}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Chip
                    label={`${item.unsigned_count} unsigned`}
                    color="error"
                    size="small"
                    variant="outlined"
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {/* Results Table */}
        {results && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Unsigned Notes Detail
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
                <NoteAdd sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography color="text.secondary">
                  No unsigned notes found. All notes are signed!
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {!results && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <NoteAdd sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              Enter filters and click "Search" to view unsigned notes.
            </Typography>
          </Paper>
        )}
      </Container>
    </LocalizationProvider>
  );
}
