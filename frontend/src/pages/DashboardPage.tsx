import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { Analytics, People, Business } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../features/auth/hooks/useAuth';
import { biApi } from '../api/bi';
import type { BIQueryResponse } from '../api/bi';

/**
 * Clinical Audit Dashboard - Overview Page
 * Shows key metrics and KPIs for clinical documentation usage
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{
    total_sessions: number;
    total_tenants: number;
    total_users: number;
  } | null>(null);
  const [sessionsByStatus, setSessionsByStatus] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get total sessions overview
      const overviewResult = await biApi.executeQuery({
        query_type: 'total_sessions',
        start_date: getDateRange(30).start,
        end_date: getDateRange(30).end,
      });

      if (overviewResult.results && overviewResult.results.length > 0) {
        setMetrics(overviewResult.results[0]);
      }

      // Get sessions by status
      const statusResult = await biApi.executeQuery({
        query_type: 'sessions_by_status',
        start_date: getDateRange(30).start,
        end_date: getDateRange(30).end,
      });

      setSessionsByStatus(statusResult.results || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Clinical Audit Dashboard
      </Typography>

      {user && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Welcome, {user.username}
            </Typography>
            <Chip label={user.role} color="primary" size="small" />
          </Box>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Analytics color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Total Sessions
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {metrics?.total_sessions?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last 30 days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Business color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Active Tenants
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {metrics?.total_tenants?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Healthcare organizations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <People color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Active Practitioners
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {metrics?.total_users?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Users in system
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Sessions by Status */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Sessions by Status
                </Typography>
                {sessionsByStatus.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    {sessionsByStatus.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 1.5,
                          borderBottom: index < sessionsByStatus.length - 1 ? 1 : 0,
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={item.status || 'Unknown'}
                            color={getStatusColor(item.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {item.session_count?.toLocaleString() || 0}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    No data available
                  </Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/analytics')}
                    startIcon={<Analytics />}
                  >
                    Query Analytics
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/audit-trail')}
                  >
                    View Audit Trail
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/unsigned-notes')}
                    color="error"
                  >
                    Unsigned Notes
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/service-usage')}
                  >
                    Service Usage
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/weekly-summary')}
                  >
                    Weekly Summary
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/adoption-analytics')}
                  >
                    Adoption Analytics
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}
