import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dashboard, Analytics, History, NoteAdd, Assessment, TrendingUp, Settings } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';

const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Sidebar navigation component
 * Follows UI/UX design plan: clean, professional navigation
 */
export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Audit Trail', icon: <History />, path: '/audit-trail' },
    { text: 'Unsigned Notes', icon: <NoteAdd />, path: '/unsigned-notes' },
    { text: 'Service Usage', icon: <Assessment />, path: '/service-usage' },
    { text: 'Weekly Summary', icon: <TrendingUp />, path: '/weekly-summary' },
    { text: 'Query Analytics', icon: <Analytics />, path: '/analytics' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
      }}
    >
      <Box sx={{ width: drawerWidth, pt: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {user && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', mt: 'auto' }}>
            <ListItemText primary={user.username} secondary={user.email} />
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
