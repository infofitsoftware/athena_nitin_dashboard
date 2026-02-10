import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  IconButton,
  Typography,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard,
  Analytics,
  History,
  NoteAdd,
  Assessment,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

const drawerWidth = 260;
const collapsedWidth = 64;

interface AppSidebarProps {
  open: boolean;
  onToggle: () => void;
}

/**
 * Permanent sidebar navigation for desktop
 * Collapsible sidebar with all dashboard pages
 */
export default function AppSidebar({ open, onToggle }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      description: 'Overview & KPIs',
    },
    {
      text: 'Audit Trail',
      icon: <History />,
      path: '/audit-trail',
      description: 'Event log & compliance',
    },
    {
      text: 'Unsigned Notes',
      icon: <NoteAdd />,
      path: '/unsigned-notes',
      description: 'Notes awaiting signature',
    },
    {
      text: 'Service Usage',
      icon: <Assessment />,
      path: '/service-usage',
      description: 'Usage analytics',
    },
    {
      text: 'Weekly Summary',
      icon: <TrendingUp />,
      path: '/weekly-summary',
      description: 'Week-over-week trends',
    },
    {
      text: 'Query Analytics',
      icon: <Analytics />,
      path: '/analytics',
      description: 'Custom SQL queries',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-end' : 'center',
          px: [1.5, 1],
        }}
      >
        {open && (
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              Athena Dashboard
            </Typography>
          </Box>
        )}
        <IconButton onClick={onToggle} size="small">
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 1,
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={item.text}
                    secondary={item.description}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: isActive ? 600 : 400,
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.75rem',
                      sx: { opacity: isActive ? 0.9 : 0.7 },
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      {open && user && (
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                {user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user.role}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
