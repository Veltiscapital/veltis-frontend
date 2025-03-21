import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TokenIcon from '@mui/icons-material/Token';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PieChartIcon from '@mui/icons-material/PieChart';
import ConnectWalletButton from './ConnectWalletButton';

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const closeDrawer = () => {
    setMobileOpen(false);
  };
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  const navItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { text: 'Tokenization', path: '/tokenization', icon: <TokenIcon fontSize="small" /> },
    { text: 'Fractionalization', path: '/fractionalization', icon: <PieChartIcon fontSize="small" /> },
    { text: 'Marketplace', path: '/marketplace', icon: <StorefrontIcon fontSize="small" /> },
  ];
  
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={closeDrawer}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
          VELTIS
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            selected={isActive(item.path)}
          >
            <Box sx={{ mr: 2, color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </Box>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: isActive(item.path) ? 'bold' : 'regular',
                color: isActive(item.path) ? 'primary.main' : 'inherit'
              }} 
            />
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <ConnectWalletButton />
      </Box>
    </Box>
  );
  
  return (
    <AppBar position="static" color="default" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo */}
          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            sx={{ 
              fontWeight: 'bold', 
              color: 'primary.main', 
              textDecoration: 'none',
              mr: 2,
              display: { xs: 'none', md: 'flex' }
            }}
          >
            VELTIS
          </Typography>
          
          {/* Mobile menu icon */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
            <IconButton
              size="large"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>
          
          {/* Mobile Logo */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold', 
              color: 'primary.main', 
              textDecoration: 'none',
              display: { xs: 'flex', md: 'none' }
            }}
          >
            VELTIS
          </Typography>
          
          {/* Desktop Navigation Links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={RouterLink}
                to={item.path}
                sx={{ 
                  my: 2, 
                  mx: 1,
                  color: isActive(item.path) ? 'primary.main' : 'text.primary',
                  fontWeight: isActive(item.path) ? 'bold' : 'medium',
                  borderBottom: isActive(item.path) ? 2 : 0,
                  borderColor: 'primary.main',
                  borderRadius: 0,
                }}
                startIcon={item.icon}
              >
                {item.text}
              </Button>
            ))}
          </Box>
          
          {/* Connect Wallet Button - Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <ConnectWalletButton />
          </Box>
        </Toolbar>
      </Container>
      
      {/* Mobile Navigation Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar; 