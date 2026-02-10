import { Box } from '@mui/material';
import { ReactNode, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import AppSidebar from './AppSidebar';

interface PageLayoutProps {
  children: ReactNode;
}

/**
 * Page layout with Header and Sidebar
 * Follows UI/UX design plan: professional layout structure
 * - Desktop: Permanent collapsible sidebar
 * - Mobile: Temporary drawer sidebar
 */
export default function PageLayout({ children }: PageLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header onMenuClick={() => setMobileSidebarOpen(true)} />
      
      {/* Mobile Sidebar (temporary drawer) */}
      <Sidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      
      {/* Desktop Sidebar (permanent, collapsible) */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <AppSidebar
            open={desktopSidebarOpen}
            onToggle={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
          />
        </Box>
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            backgroundColor: 'background.default',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
