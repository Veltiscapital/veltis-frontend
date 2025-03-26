import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { Card, CardContent, Typography, Button, Grid, Chip, Box, TextField, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

// Contract ABIs and addresses would be imported from configuration files
import { SECONDARY_MARKET_ABI } from '../../config/abis';
import { SECONDARY_MARKET_ADDRESS } from '../../config/addresses';

// Types
interface Listing {
  listingId: string;
  seller: string;
  tokenContract: string;
  tokenAmount: string;
  pricePerToken: string;
  createdAt: number;
  expiresAt: number;
  state: number; // 0: Active, 1: Filled, 2: Cancelled
  listingType: number; // 0: Fixed, 1: Auction
  minBid: string;
  highestBidder: string;
  highestBid: string;
  auctionEndTime: number;
  tokenName?: string; // Not from contract, fetched separately
  tokenSymbol?: string; // Not from contract, fetched separately
  ipnftId?: string; // Not from contract, fetched separately
}

type ListingState = 'Active' | 'Filled' | 'Cancelled';
type ListingType = 'Fixed' | 'Auction';

const stateMap: Record<number, ListingState> = {
  0: 'Active',
  1: 'Filled',
  2: 'Cancelled'
};

const typeMap: Record<number, ListingType> = {
  0: 'Fixed',
  1: 'Auction'
};

interface MarketplaceListingProps {
  listingId: string;
  onPurchase?: () => void;
}

const MarketplaceListing: React.FC<MarketplaceListingProps> = ({ listingId, onPurchase }) => {
  const { account, library } = useWeb3React();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState('1');
  const [bidAmount, setBidAmount] = useState('');
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [tokenInfo, setTokenInfo] = useState({ name: '', symbol: '', ipnftId: '' });

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      if (!library || !listingId) return;
      
      try {
        const marketContract = new ethers.Contract(
          SECONDARY_MARKET_ADDRESS,
          SECONDARY_MARKET_ABI,
          library.getSigner()
        );
        
        const listingData = await marketContract.getListing(listingId);
        setListing({
          listingId: listingData.listingId.toString(),
          seller: listingData.seller,
          tokenContract: listingData.tokenContract,
          tokenAmount: ethers.utils.formatEther(listingData.tokenAmount),
          pricePerToken: ethers.utils.formatEther(listingData.pricePerToken),
          createdAt: listingData.createdAt.toNumber(),
          expiresAt: listingData.expiresAt.toNumber(),
          state: listingData.state,
          listingType: listingData.listingType,
          minBid: ethers.utils.formatEther(listingData.minBid),
          highestBidder: listingData.highestBidder,
          highestBid: ethers.utils.formatEther(listingData.highestBid),
          auctionEndTime: listingData.auctionEndTime.toNumber()
        });

        // Fetch token information
        const tokenContract = new ethers.Contract(
          listingData.tokenContract,
          ['function name() view returns (string)', 'function symbol() view returns (string)', 'function ipnftId() view returns (uint256)'],
          library.getSigner()
        );

        const [name, symbol, ipnftId] = await Promise.all([
          tokenContract.name(),
          tokenContract.symbol(),
          tokenContract.ipnftId().catch(() => ethers.BigNumber.from(0))
        ]);

        setTokenInfo({ name, symbol, ipnftId: ipnftId.toString() });
        
        // Set initial bid amount to minimum valid bid
        if (listingData.listingType === 1) { // Auction
          const minValidBid = listingData.highestBid.gt(0)
            ? ethers.utils.formatEther(listingData.highestBid.add(listingData.minBid))
            : ethers.utils.formatEther(listingData.pricePerToken);
          
          setBidAmount(minValidBid);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        toast.error("Failed to fetch listing details");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [library, listingId]);

  // Buy tokens
  const handleBuy = async () => {
    if (!library || !listing || !account) return;
    
    setProcessing(true);
    try {
      const marketContract = new ethers.Contract(
        SECONDARY_MARKET_ADDRESS,
        SECONDARY_MARKET_ABI,
        library.getSigner()
      );
      
      // Calculate total cost
      const amount = ethers.utils.parseEther(buyAmount);
      const totalCost = ethers.utils.parseEther(listing.pricePerToken).mul(amount).div(ethers.utils.parseEther('1'));
      
      // Execute purchase
      const tx = await marketContract.buyTokens(
        listing.listingId,
        amount,
        { value: totalCost }
      );
      
      await tx.wait();
      toast.success("Purchase successful!");
      setBuyDialogOpen(false);
      
      // Refresh listing data
      if (onPurchase) onPurchase();
    } catch (error) {
      console.error("Error buying tokens:", error);
      toast.error("Failed to complete purchase");
    } finally {
      setProcessing(false);
    }
  };

  // Place bid
  const handleBid = async () => {
    if (!library || !listing || !account) return;
    
    setProcessing(true);
    try {
      const marketContract = new ethers.Contract(
        SECONDARY_MARKET_ADDRESS,
        SECONDARY_MARKET_ABI,
        library.getSigner()
      );
      
      // Calculate bid amount in wei
      const bidAmountWei = ethers.utils.parseEther(bidAmount);
      
      // Execute bid
      const tx = await marketContract.placeBid(
        listing.listingId,
        { value: bidAmountWei }
      );
      
      await tx.wait();
      toast.success("Bid placed successfully!");
      setBidDialogOpen(false);
      
      // Refresh listing data
      if (onPurchase) onPurchase();
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error("Failed to place bid");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!listing) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error">
            Listing not found or error loading data
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const isActive = listing.state === 0;
  const isAuction = listing.listingType === 1;
  const isExpired = isAuction && listing.auctionEndTime < Math.floor(Date.now() / 1000);
  const isUserSeller = account && account.toLowerCase() === listing.seller.toLowerCase();
  const isHighestBidder = isAuction && account && account.toLowerCase() === listing.highestBidder.toLowerCase();

  // Buy Dialog
  const renderBuyDialog = () => (
    <Dialog open={buyDialogOpen} onClose={() => setBuyDialogOpen(false)}>
      <DialogTitle>Buy Tokens</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <TextField
            label="Amount of tokens to buy"
            type="number"
            fullWidth
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            InputProps={{ inputProps: { min: "0.000001", max: listing.tokenAmount, step: "0.000001" } }}
            margin="normal"
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Available: {listing.tokenAmount} {tokenInfo.symbol}
          </Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Total Cost: {
              Number(buyAmount) > 0 
                ? (Number(buyAmount) * Number(listing.pricePerToken)).toFixed(6)
                : '0'
            } ETH
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setBuyDialogOpen(false)} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleBuy} 
          color="primary" 
          variant="contained"
          disabled={processing || Number(buyAmount) <= 0 || Number(buyAmount) > Number(listing.tokenAmount)}
        >
          {processing ? <CircularProgress size={24} /> : 'Buy Tokens'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Bid Dialog
  const renderBidDialog = () => (
    <Dialog open={bidDialogOpen} onClose={() => setBidDialogOpen(false)}>
      <DialogTitle>Place Bid</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <TextField
            label="Bid amount (ETH)"
            type="number"
            fullWidth
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            InputProps={{ 
              inputProps: { 
                min: listing.highestBid ? (Number(listing.highestBid) + Number(listing.minBid)).toString() : listing.pricePerToken,
                step: "0.000001" 
              } 
            }}
            margin="normal"
          />
          {listing.highestBid !== '0' && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Current highest bid: {listing.highestBid} ETH
            </Typography>
          )}
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Minimum bid increment: {listing.minBid} ETH
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setBidDialogOpen(false)} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleBid} 
          color="primary" 
          variant="contained"
          disabled={
            processing || 
            Number(bidAmount) <= 0 || 
            (listing.highestBid !== '0' && Number(bidAmount) < (Number(listing.highestBid) + Number(listing.minBid))) ||
            (listing.highestBid === '0' && Number(bidAmount) < Number(listing.pricePerToken))
          }
        >
          {processing ? <CircularProgress size={24} /> : 'Place Bid'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h5" component="div">
                  {tokenInfo.name || 'Fractionalized Token'}
                </Typography>
                <Chip 
                  label={stateMap[listing.state]} 
                  color={listing.state === 0 ? "success" : listing.state === 1 ? "primary" : "default"}
                />
              </Box>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                {tokenInfo.symbol} {tokenInfo.ipnftId && `(IP NFT #${tokenInfo.ipnftId})`}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  <AccountBalanceWalletIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  Seller: {listing.seller.substring(0, 6)}...{listing.seller.substring(listing.seller.length - 4)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  Created: {formatDistanceToNow(new Date(listing.createdAt * 1000), { addSuffix: true })}
                </Typography>
                {listing.expiresAt > 0 && (
                  <Typography variant="body2" color={isExpired ? "error" : "textSecondary"}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    {isExpired ? "Expired" : "Expires"}: {formatDistanceToNow(new Date(listing.expiresAt * 1000), { addSuffix: true })}
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box display="flex" flexDirection="column" alignItems="flex-end">
                <Typography variant="h6" color="primary">
                  {isAuction ? 'Starting Price' : 'Price'}: {listing.pricePerToken} ETH per token
                </Typography>
                <Typography variant="body1">
                  Available: {listing.tokenAmount} {tokenInfo.symbol}
                </Typography>
                {isAuction && listing.highestBid !== '0' && (
                  <Typography variant="body1" color="primary">
                    Highest Bid: {listing.highestBid} ETH
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                {isActive && !isUserSeller && !isExpired && (
                  isAuction ? (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => setBidDialogOpen(true)}
                      disabled={isHighestBidder}
                    >
                      {isHighestBidder ? "You are highest bidder" : "Place Bid"}
                    </Button>
                  ) : (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => setBuyDialogOpen(true)}
                    >
                      Buy Tokens
                    </Button>
                  )
                )}
                
                {isAuction && isExpired && isActive && (
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => toast.info("End auction functionality not implemented in this demo")}
                  >
                    End Auction
                  </Button>
                )}
                
                {isActive && isUserSeller && (
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={() => toast.info("Cancel listing functionality not implemented in this demo")}
                  >
                    Cancel Listing
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {renderBuyDialog()}
      {renderBidDialog()}
    </>
  );
};

export default MarketplaceListing; 