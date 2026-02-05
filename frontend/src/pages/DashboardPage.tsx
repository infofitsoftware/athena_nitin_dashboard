import { Box, Container, Typography, Button, Paper, Chip, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Analytics } from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../features/auth/hooks/useAuth';

/**
 * Dashboard Page
 * Shows user info and placeholder for Phase 4 content
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <Container maxWidth="xl">
      <Box sx={{ marginTop: 4, marginBottom: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography component="h1" variant="h4">
            Dashboard
          </Typography>
          <Button variant="outlined" color="error" onClick={logout}>
            Logout
          </Button>
        </Box>

        {user && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Welcome, {user.username}!
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Email: {user.email}
              </Typography>
              <Chip label={user.role} color="primary" size="small" />
            </Box>
          </Paper>
        )}

        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Dashboard content - Coming in Phase 4
          </Typography>
          <Button
            variant="contained"
            startIcon={<Analytics />}
            onClick={() => navigate('/analytics')}
            sx={{ mt: 2 }}
          >
            Go to Query Analytics
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
