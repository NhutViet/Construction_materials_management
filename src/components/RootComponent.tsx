import React, { useState } from "react";
import NavBarComponent from "./NavBarComponent";
import { Box, Grid, Drawer, useMediaQuery, useTheme } from "@mui/material";
import SideBarComponent from "./SideBarComponent";
import { Outlet } from "react-router-dom";

const RootComponent: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Fixed Header */}
      <NavBarComponent onMenuClick={handleDrawerToggle} />

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flex: 1 }} className="main-content">
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#f5f5f5',
              top: '64px', // Position below header
              height: 'calc(100vh - 64px)' // Full height minus header
            },
          }}
        >
          <SideBarComponent onItemClick={() => setMobileOpen(false)} />
        </Drawer>

        {/* Desktop Sidebar */}
        <Box
          component="nav"
          sx={{ 
            width: { md: drawerWidth }, 
            flexShrink: { md: 0 },
            display: { xs: 'none', md: 'block' },
            zIndex: 1 // Lower than header
          }}
        >
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                backgroundColor: '#f5f5f5',
                borderRight: '1px solid #e0e0e0',
                height: 'calc(100vh - 64px)', // Full height minus header
                zIndex: 1 // Lower than header
              },
            }}
            open
          >
            <SideBarComponent />
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            minHeight: 'calc(100vh - 64px)',
            backgroundColor: '#fafafa',
            overflow: 'auto',
            
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default RootComponent;
