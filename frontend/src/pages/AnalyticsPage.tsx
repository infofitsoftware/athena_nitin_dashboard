import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { PlayArrow, Clear } from '@mui/icons-material';
import { analyticsApi } from '../api/analytics';
import type { QueryRequest, QueryResponse } from '../api/analytics';
import DataTable from '../components/tables/DataTable';

/**
 * Analytics Page - Query interface with sidebar and results table
 */
export default function AnalyticsPage() {
  const [query, setQuery] = useState('SELECT * FROM ');
  const [database, setDatabase] = useState('');
  const [limit, setLimit] = useState<number | undefined>(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);

  const handleExecute = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError(null);
    setQueryResult(null);

    try {
      const request: QueryRequest = {
        query: query.trim(),
        database: database || undefined,
        limit: limit || undefined,
      };

      const result = await analyticsApi.executeQuery(request);
      setQueryResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Query execution failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('SELECT * FROM ');
    setDatabase('');
    setLimit(1000);
    setError(null);
    setQueryResult(null);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        Query Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Left Sidebar - Query Builder */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content', position: 'sticky', top: 24 }}>
            <Typography variant="h6" gutterBottom>
              Query Builder
            </Typography>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Database (optional)"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
                placeholder="Leave empty to use default"
              />

              <TextField
                fullWidth
                label="Query"
                multiline
                rows={8}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SELECT * FROM table_name"
                sx={{ mb: 2 }}
                InputProps={{
                  sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
                }}
              />

              <TextField
                fullWidth
                label="Limit (max rows)"
                type="number"
                value={limit || ''}
                onChange={(e) => setLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                size="small"
                inputProps={{ min: 1, max: 10000 }}
                sx={{ mb: 2 }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
                onClick={handleExecute}
                disabled={loading || !query.trim()}
                fullWidth
              >
                {loading ? 'Executing...' : 'Execute Query'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {queryResult && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Query Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Chip
                    label={`${queryResult.row_count} rows`}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={`${(queryResult.execution_time_ms / 1000).toFixed(2)}s`}
                    size="small"
                  />
                  <Chip
                    label={`${(queryResult.data_scanned_bytes / 1024 / 1024).toFixed(2)} MB`}
                    size="small"
                  />
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Side - Results Table */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Query Results
            </Typography>

            {!queryResult && !loading && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 400,
                  color: 'text.secondary',
                }}
              >
                <Typography>Enter a query and click "Execute Query" to see results</Typography>
              </Box>
            )}

            {loading && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 400,
                }}
              >
                <CircularProgress />
              </Box>
            )}

            {queryResult && queryResult.results.length > 0 && (
              <DataTable data={queryResult.results} columns={queryResult.columns} />
            )}

            {queryResult && queryResult.results.length === 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 400,
                  color: 'text.secondary',
                }}
              >
                <Typography>Query executed successfully but returned no results</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
