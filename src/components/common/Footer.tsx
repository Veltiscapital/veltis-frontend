import React from 'react';
import { Box, Container, Typography, Link, Grid, IconButton } from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import TelegramIcon from '@mui/icons-material/Telegram';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              VELTIS
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A revolutionary platform for intellectual property tokenization, fractionalization, and trading.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="primary" aria-label="Twitter" component="a" href="https://twitter.com/veltis" target="_blank">
                <TwitterIcon />
              </IconButton>
              <IconButton color="primary" aria-label="LinkedIn" component="a" href="https://linkedin.com/company/veltis" target="_blank">
                <LinkedInIcon />
              </IconButton>
              <IconButton color="primary" aria-label="GitHub" component="a" href="https://github.com/veltis" target="_blank">
                <GitHubIcon />
              </IconButton>
              <IconButton color="primary" aria-label="Telegram" component="a" href="https://t.me/veltis" target="_blank">
                <TelegramIcon />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Platform
            </Typography>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>
                <Link component={RouterLink} to="/dashboard" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' }, display: 'block', mb: 1 }}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link component={RouterLink} to="/tokenization" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' }, display: 'block', mb: 1 }}>
                  Tokenization
                </Link>
              </li>
              <li>
                <Link component={RouterLink} to="/fractionalization" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' }, display: 'block', mb: 1 }}>
                  Fractionalization
                </Link>
              </li>
              <li>
                <Link component={RouterLink} to="/marketplace" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' }, display: 'block', mb: 1 }}>
                  Marketplace
                </Link>
              </li>
            </ul>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>
                <Link component="a" href="https://docs.veltis.io" target="_blank" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' }, display: 'block', mb: 1 }}>
                  Documentation
                </Link>
              </li>
              <li>
                <Link component="a" href="https://veltis.io/faq" target="_blank" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' }, display: 'block', mb: 1 }}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link component="a" href="https://veltis.io/whitepaper" target="_blank" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' }, display: 'block', mb: 1 }}>
                  Whitepaper
                </Link>
              </li>
              <li>
                <Link component="a" href="https://veltis.io/privacy" target="_blank" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' }, display: 'block', mb: 1 }}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </Grid>
        </Grid>
        
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            <Link color="inherit" component="a" href="https://veltis.io">
              Veltis
            </Link>{' '}
            {new Date().getFullYear()}
            {'. All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 