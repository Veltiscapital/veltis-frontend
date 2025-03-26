import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, CircularProgress, Button, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { toast } from 'react-toastify';

// Import contract ABIs and addresses
import { SECONDARY_MARKET_ABI } from '../config/abis';
import { SECONDARY_MARKET_ADDRESS } from '../config/addresses';

// Import components
import MarketplaceListing from '../components/marketplace/MarketplaceListing';
import ConnectWalletButton from '../components/common/ConnectWalletButton';

// Types
interface ListingFilter {
  search: string;
  type: string; // 'all', 'fixed', 'auction'
  status: string; // 'active', 'filled', 'cancelled', 'all'
  sort: string; // 'newest', 'oldest', 'price-asc', 'price-desc'
}

const MarketplacePage: React.FC = () => {
  const { account, library, active } = useWeb3React();
  const [activeTab, setActiveTab] = useState(0);
  const [listingIds, setListingIds] = useState<string[]>([]);
  const [userListingIds, setUserListingIds] = useState<string[]>([]);
  const [userPurchaseIds, setUserPurchaseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ListingFilter>({
    search: '',
    type: 'all',
    status: 'active',
    sort: 'newest'
  });
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  // Fetch all listing IDs from the contract
  useEffect(() => {
    const fetchListings = async () => {
      if (!library) return;
      
      try {
        setLoading(true);
        
        // This is a simplified approach. In a real implementation, 
        // you would need a more efficient way to get all listings,
        // like an event listener or indexer service
        const marketContract = new ethers.Contract(
          SECONDARY_MARKET_ADDRESS,
          SECONDARY_MARKET_ABI,
          library.getSigner()
        );
        
        // Mock implementation - in reality would get this from backend/events
        const mockListingCount = 20;
        const mockIds = Array.from({ length: mockListingCount }, (_, i) => (i + 1).toString());
        
        setListingIds(mockIds);
        
        // If connected, fetch user listings and purchases
        if (account) {
          const userListings = await marketContract.getUserListings(account);
          const userPurchases = await marketContract.getUserPurchases(account);
          
          setUserListingIds(userListings.map((id: ethers.BigNumber) => id.toString()));
          setUserPurchaseIds(userPurchases.map((id: ethers.BigNumber) => id.toString()));
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        toast.error("Failed to fetch marketplace listings");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [library, account, activeTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(1);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setFilter(prev => ({ ...prev, [name as string]: value }));
    setPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({ ...prev, search: event.target.value }));
    setPage(1);
  };

  const refreshListings = () => {
    // Refresh the listings after a purchase/bid
    const fetchListings = async () => {
      if (!library) return;
      
      try {
        setLoading(true);
        
        const marketContract = new ethers.Contract(
          SECONDARY_MARKET_ADDRESS,
          SECONDARY_MARKET_ABI,
          library.getSigner()
        );
        
        // Mock implementation - in reality would get this from backend/events
        const mockListingCount = 20;
        const mockIds = Array.from({ length: mockListingCount }, (_, i) => (i + 1).toString());
        
        setListingIds(mockIds);
        
        // If connected, fetch user listings and purchases
        if (account) {
          const userListings = await marketContract.getUserListings(account);
          const userPurchases = await marketContract.getUserPurchases(account);
          
          setUserListingIds(userListings.map((id: ethers.BigNumber) => id.toString()));
          setUserPurchaseIds(userPurchases.map((id: ethers.BigNumber) => id.toString()));
        }
      } catch (error) {
        console.error("Error refreshing listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  };

  // Filter and paginate listings
  const getDisplayedListings = () => {
    let displayedIds: string[] = [];
    
    // First filter by tab
    switch (activeTab) {
      case 0: // All listings
        displayedIds = [...listingIds];
        break;
      case 1: // My Listings
        displayedIds = [...userListingIds];
        break;
      case 2: // My Purchases
        displayedIds = [...userPurchaseIds];
        break;
      default:
        displayedIds = [...listingIds];
    }
    
    // Apply filters (mock filtering, would be done on contract/backend in real implementation)
    // For example, we're just using the ID number here to mock filtering
    if (filter.status !== 'all') {
      // In a real implementation, you would filter by status
      displayedIds = displayedIds.filter(id => {
        const idNum = parseInt(id);
        if (filter.status === 'active') return idNum % 3 === 0;
        if (filter.status === 'filled') return idNum % 3 === 1;
        if (filter.status === 'cancelled') return idNum % 3 === 2;
        return true;
      });
    }
    
    if (filter.type !== 'all') {
      // In a real implementation, you would filter by type
      displayedIds = displayedIds.filter(id => {
        const idNum = parseInt(id);
        if (filter.type === 'fixed') return idNum % 2 === 0;
        if (filter.type === 'auction') return idNum % 2 === 1;
        return true;
      });
    }
    
    if (filter.search) {
      // In a real implementation, you would search by token name, etc.
      displayedIds = displayedIds.filter(id => id.includes(filter.search));
    }
    
    // Sort listings
    displayedIds.sort((a, b) => {
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      
      switch (filter.sort) {
        case 'newest':
          return bNum - aNum;
        case 'oldest':
          return aNum - bNum;
        case 'price-asc':
          // Mock price sorting
          return (aNum % 10) - (bNum % 10);
        case 'price-desc':
          // Mock price sorting
          return (bNum % 10) - (aNum % 10);
        default:
          return 0;
      }
    });
    
    // Paginate
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return displayedIds.slice(startIndex, endIndex);
  };

  const displayedListings = getDisplayedListings();
  const totalPages = Math.max(1, Math.ceil((activeTab === 0 ? listingIds.length : 
                              activeTab === 1 ? userListingIds.length : 
                              userPurchaseIds.length) / itemsPerPage));

  // Handle creating a new listing (mock function)
  const handleCreateListing = () => {
    toast.info("Create listing functionality not implemented in this demo");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          IP NFT Marketplace
        </Typography>
        
        {active ? (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCreateListing}
          >
            Create Listing
          </Button>
        ) : (
          <ConnectWalletButton />
        )}
      </Box>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ mb: 4 }}
      >
        <Tab label="All Listings" />
        <Tab label="My Listings" disabled={!active} />
        <Tab label="My Purchases" disabled={!active} />
      </Tabs>
      
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by token name, IP NFT ID..."
              variant="outlined"
              value={filter.search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="type-filter-label">Type</InputLabel>
              <Select
                labelId="type-filter-label"
                label="Type"
                name="type"
                value={filter.type}
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="fixed">Fixed Price</MenuItem>
                <MenuItem value="auction">Auction</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Status"
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="filled">Filled</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="sort-filter-label">Sort By</InputLabel>
              <Select
                labelId="sort-filter-label"
                label="Sort By"
                name="sort"
                value={filter.sort}
                onChange={handleFilterChange}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
                <MenuItem value="price-asc">Price: Low to High</MenuItem>
                <MenuItem value="price-desc">Price: High to Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : displayedListings.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="textSecondary">
            {activeTab === 0 
              ? "No listings found matching your criteria"
              : activeTab === 1 
              ? "You haven't created any listings yet"
              : "You haven't made any purchases yet"}
          </Typography>
          {(activeTab === 1 && active) && (
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={handleCreateListing}
            >
              Create Your First Listing
            </Button>
          )}
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {displayedListings.map((id) => (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <MarketplaceListing listingId={id} onPurchase={refreshListings} />
              </Grid>
            ))}
          </Grid>
          
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={(_event, value) => setPage(value)} 
              color="primary" 
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default MarketplacePage; 