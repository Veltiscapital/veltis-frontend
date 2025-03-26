import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  Tabs, 
  Tab, 
  CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import ConnectWalletButton from '../components/common/ConnectWalletButton';
import { IPNFT_REGISTRY_ABI } from '../config/abis';
import { getAddresses } from '../config/addresses';

// Types
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface IPNFTData {
  id: string;
  title: string;
  type: string;
  developmentStage: string;
  valuationUSD: string;
  institution: string;
  verified: boolean;
  imageUrl: string;
}

interface FractionalizedTokenData {
  address: string;
  name: string;
  symbol: string;
  totalShares: string;
  sharePrice: string;
  ipnftId: string;
  ipnftTitle: string;
  tokenImageUrl: string;
}

interface MarketplaceActivityData {
  type: 'purchase' | 'listing' | 'bid' | 'auction';
  tokenSymbol: string;
  tokenName: string;
  timestamp: number;
  amount: string;
  price: string;
  status: 'completed' | 'active' | 'cancelled';
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const DashboardPage: React.FC = () => {
  const { account, active, library } = useWeb3React();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ownedIPNFTs, setOwnedIPNFTs] = useState<IPNFTData[]>([]);
  const [fractionalizedTokens, setFractionalizedTokens] = useState<FractionalizedTokenData[]>([]);
  const [marketplaceActivity, setMarketplaceActivity] = useState<MarketplaceActivityData[]>([]);
  const addresses = getAddresses();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Mock function to fetch owned IP NFTs
  const fetchOwnedIPNFTs = async () => {
    if (!active || !account || !library) return;
    
    setLoading(true);
    try {
      // This would normally use the actual contract call
      const ipnftContract = new ethers.Contract(
        addresses.IPNFT_REGISTRY, 
        IPNFT_REGISTRY_ABI, 
        library.getSigner()
      );
      
      // Mock data - would normally get from contract
      const mockData: IPNFTData[] = [
        {
          id: '1',
          title: "Novel Treatment for Alzheimer's Disease",
          type: 'Patent',
          developmentStage: 'Clinical Trial',
          valuationUSD: '750000',
          institution: 'Stanford University',
          verified: true,
          imageUrl: 'https://picsum.photos/seed/ipnft1/300/200'
        },
        {
          id: '2',
          title: 'Quantum Computing Algorithm',
          type: 'Software',
          developmentStage: 'Production',
          valuationUSD: '1250000',
          institution: 'MIT',
          verified: true,
          imageUrl: 'https://picsum.photos/seed/ipnft2/300/200'
        },
        {
          id: '3',
          title: 'Novel Biodegradable Plastic',
          type: 'Patent',
          developmentStage: 'Prototype',
          valuationUSD: '500000',
          institution: 'Berkeley',
          verified: false,
          imageUrl: 'https://picsum.photos/seed/ipnft3/300/200'
        }
      ];
      
      setOwnedIPNFTs(mockData);
    } catch (error) {
      console.error('Error fetching owned IP NFTs:', error);
      toast.error('Failed to load your IP NFTs');
    } finally {
      setLoading(false);
    }
  };

  // Mock function to fetch fractionalized tokens
  const fetchFractionalizedTokens = async () => {
    if (!active || !account || !library) return;
    
    setLoading(true);
    try {
      // Mock data - would normally get from contract
      const mockData: FractionalizedTokenData[] = [
        {
          address: '0x1234567890123456789012345678901234567890',
          name: "Alzheimer Treatment Shares",
          symbol: 'ALZT',
          totalShares: '100000',
          sharePrice: '7.5',
          ipnftId: '1',
          ipnftTitle: "Novel Treatment for Alzheimer's Disease",
          tokenImageUrl: 'https://picsum.photos/seed/frac1/300/200'
        },
        {
          address: '0x2345678901234567890123456789012345678901',
          name: 'Quantum Algorithm Shares',
          symbol: 'QALG',
          totalShares: '50000',
          sharePrice: '25',
          ipnftId: '2',
          ipnftTitle: 'Quantum Computing Algorithm',
          tokenImageUrl: 'https://picsum.photos/seed/frac2/300/200'
        }
      ];
      
      setFractionalizedTokens(mockData);
    } catch (error) {
      console.error('Error fetching fractionalized tokens:', error);
      toast.error('Failed to load your fractionalized tokens');
    } finally {
      setLoading(false);
    }
  };

  // Mock function to fetch marketplace activity
  const fetchMarketplaceActivity = async () => {
    if (!active || !account || !library) return;
    
    setLoading(true);
    try {
      // Mock data - would normally get from contract events
      const mockData: MarketplaceActivityData[] = [
        {
          type: 'listing',
          tokenSymbol: 'ALZT',
          tokenName: 'Alzheimer Treatment Shares',
          timestamp: Date.now() - 86400000, // 1 day ago
          amount: '1000',
          price: '8.2',
          status: 'active'
        },
        {
          type: 'purchase',
          tokenSymbol: 'QALG',
          tokenName: 'Quantum Algorithm Shares',
          timestamp: Date.now() - 172800000, // 2 days ago
          amount: '500',
          price: '24.5',
          status: 'completed'
        },
        {
          type: 'bid',
          tokenSymbol: 'ALZT',
          tokenName: 'Alzheimer Treatment Shares',
          timestamp: Date.now() - 259200000, // 3 days ago
          amount: '250',
          price: '7.8',
          status: 'completed'
        },
        {
          type: 'auction',
          tokenSymbol: 'QALG',
          tokenName: 'Quantum Algorithm Shares',
          timestamp: Date.now() - 345600000, // 4 days ago
          amount: '1000',
          price: '23.5',
          status: 'completed'
        }
      ];
      
      setMarketplaceActivity(mockData);
    } catch (error) {
      console.error('Error fetching marketplace activity:', error);
      toast.error('Failed to load your marketplace activity');
    } finally {
      setLoading(false);
    }
  };

  // Format number to USD
  const formatUSD = (value: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(Number(value));
  };

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Load data when account changes
  useEffect(() => {
    if (active && account) {
      fetchOwnedIPNFTs();
      fetchFractionalizedTokens();
      fetchMarketplaceActivity();
    } else {
      setOwnedIPNFTs([]);
      setFractionalizedTokens([]);
      setMarketplaceActivity([]);
      setLoading(false);
    }
  }, [active, account]);

  // Render IP NFT cards
  const renderIPNFTCards = () => {
    if (ownedIPNFTs.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            You don't own any IP NFTs yet
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={RouterLink} 
            to="/tokenization/create"
            sx={{ mt: 2 }}
          >
            Create New IP NFT
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {ownedIPNFTs.map((ipnft) => (
          <Grid item xs={12} sm={6} md={4} key={ipnft.id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={ipnft.imageUrl}
                alt={ipnft.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                  {ipnft.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Type: {ipnft.type}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Stage: {ipnft.developmentStage}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Institution: {ipnft.institution}
                </Typography>
                <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                  Valuation: {formatUSD(ipnft.valuationUSD)}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button 
                    size="small" 
                    variant="outlined"
                    component={RouterLink}
                    to={`/ipnft/${ipnft.id}`}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained"
                    component={RouterLink}
                    to={`/fractionalization/create?ipnftId=${ipnft.id}`}
                  >
                    Fractionalize
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render fractionalized tokens cards
  const renderFractionalizedTokens = () => {
    if (fractionalizedTokens.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            You don't have any fractionalized tokens yet
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={RouterLink} 
            to="/fractionalization"
            sx={{ mt: 2 }}
          >
            Fractionalize an IP NFT
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {fractionalizedTokens.map((token) => (
          <Grid item xs={12} sm={6} md={4} key={token.address}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={token.tokenImageUrl}
                alt={token.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                  {token.name} ({token.symbol})
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Based on: {token.ipnftTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Shares: {parseInt(token.totalShares).toLocaleString()}
                </Typography>
                <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                  Price per Share: {formatUSD(token.sharePrice)}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button 
                    size="small" 
                    variant="outlined"
                    component={RouterLink}
                    to={`/token/${token.address}`}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained"
                    component={RouterLink}
                    to={`/marketplace/create?tokenAddress=${token.address}`}
                  >
                    List for Sale
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render marketplace activity
  const renderMarketplaceActivity = () => {
    if (marketplaceActivity.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            You don't have any marketplace activity yet
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={RouterLink} 
            to="/marketplace"
            sx={{ mt: 2 }}
          >
            Go to Marketplace
          </Button>
        </Box>
      );
    }

    return (
      <Box>
        {marketplaceActivity.map((activity, index) => (
          <Paper 
            key={index} 
            sx={{ 
              p: 2, 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              borderLeft: 6,
              borderColor: activity.status === 'active' ? 'info.main' : 
                            activity.status === 'completed' ? 'success.main' : 'error.main'
            }}
          >
            <Box>
              <Typography variant="body1" fontWeight="bold">
                {activity.type === 'purchase' ? 'Purchased' : 
                 activity.type === 'listing' ? 'Listed' : 
                 activity.type === 'bid' ? 'Bid on' : 'Created Auction for'} 
                {' '}{activity.tokenName} ({activity.tokenSymbol})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(activity.timestamp)} • {parseInt(activity.amount).toLocaleString()} shares • {formatUSD(activity.price)} per share
              </Typography>
            </Box>
            <Box>
              <Button 
                variant="outlined" 
                size="small"
                component={RouterLink}
                to={activity.type === 'listing' || activity.type === 'auction' ? 
                  `/marketplace/listing/${activity.tokenSymbol}` : 
                  `/token/${activity.tokenSymbol}`}
              >
                {activity.status === 'active' ? 'Manage' : 'View'}
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Dashboard
        </Typography>
        <ConnectWalletButton />
      </Box>

      {!active ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Connect your wallet to view your dashboard
          </Typography>
          <Box sx={{ mt: 2, mb: 3 }}>
            <ConnectWalletButton />
          </Box>
        </Paper>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
              <Tab label="My IP NFTs" {...a11yProps(0)} />
              <Tab label="Fractionalized Tokens" {...a11yProps(1)} />
              <Tab label="Marketplace Activity" {...a11yProps(2)} />
            </Tabs>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TabPanel value={tabValue} index={0}>
                {renderIPNFTCards()}
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                {renderFractionalizedTokens()}
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                {renderMarketplaceActivity()}
              </TabPanel>
            </>
          )}
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              component={RouterLink}
              to="/tokenization/create"
            >
              Create New IP NFT
            </Button>
            <Button 
              variant="contained" 
              color="secondary"
              component={RouterLink}
              to="/marketplace"
            >
              Go to Marketplace
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default DashboardPage; 