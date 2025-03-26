import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CircularProgress, 
  Container, 
  Divider, 
  FormControl, 
  FormHelperText, 
  Grid, 
  InputAdornment, 
  InputLabel, 
  MenuItem, 
  Paper, 
  Select, 
  Stack, 
  Step, 
  StepLabel, 
  Stepper, 
  Switch,
  TextField, 
  Typography,
  FormControlLabel,
  Alert
} from '@mui/material';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { toast } from 'react-toastify';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Contract ABIs and addresses would be imported from configuration files
import { SECONDARY_MARKET_ABI } from '../../config/abis';
import { SECONDARY_MARKET_ADDRESS } from '../../config/addresses';

// Types for fractionalized tokens
interface FractionalizedToken {
  contractAddress: string;
  name: string;
  symbol: string;
  balance: string;
  ipnftId?: string;
}

// Form values
interface CreateListingFormValues {
  tokenContract: string;
  tokenAmount: string;
  listingType: 'fixed' | 'auction';
  pricePerToken: string;
  duration: string; // In hours, 0 = no expiry for fixed price
  minBid: string; // For auction type only
}

const CreateListingForm: React.FC = () => {
  const { account, library } = useWeb3React();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [listingId, setListingId] = useState<string | null>(null);
  const [ownedTokens, setOwnedTokens] = useState<FractionalizedToken[]>([]);
  const [selectedToken, setSelectedToken] = useState<FractionalizedToken | null>(null);

  // Form setup
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateListingFormValues>({
    defaultValues: {
      tokenContract: '',
      tokenAmount: '',
      listingType: 'fixed',
      pricePerToken: '',
      duration: '0', // Default: no expiry for fixed
      minBid: '0.01', // Default minimum bid increment
    }
  });

  // Watch values for conditional rendering
  const watchListingType = watch('listingType');
  const watchTokenContract = watch('tokenContract');
  const watchTokenAmount = watch('tokenAmount');
  
  // Steps for the listing creation process
  const steps = ['Select Token', 'Set Listing Details', 'Review & Submit'];

  // Load owned fractionalized tokens
  useEffect(() => {
    const fetchOwnedTokens = async () => {
      if (!library || !account) return;
      
      setLoading(true);
      try {
        // In a real implementation, fetch tokens from blockchain or backend
        // Here we're using mock data for demonstration
        
        const mockTokens: FractionalizedToken[] = [
          {
            contractAddress: '0x1234567890123456789012345678901234567890',
            name: 'Cancer Research Token',
            symbol: 'CRT',
            balance: '5000',
            ipnftId: '1'
          },
          {
            contractAddress: '0x0987654321098765432109876543210987654321',
            name: 'Vaccine IP Token',
            symbol: 'VIT',
            balance: '2500',
            ipnftId: '2'
          },
          {
            contractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
            name: 'Medical Device Token',
            symbol: 'MDT',
            balance: '1000',
            ipnftId: '3'
          }
        ];
        
        setOwnedTokens(mockTokens);
      } catch (error) {
        console.error('Error fetching owned tokens:', error);
        toast.error('Failed to load your fractionalized tokens');
      } finally {
        setLoading(false);
      }
    };

    fetchOwnedTokens();
  }, [library, account]);

  // Update selected token when tokenContract changes
  useEffect(() => {
    if (watchTokenContract) {
      const token = ownedTokens.find(t => t.contractAddress === watchTokenContract);
      setSelectedToken(token || null);
      
      // Reset token amount if the token changes
      if (token && watchTokenAmount && parseFloat(watchTokenAmount) > parseFloat(token.balance)) {
        setValue('tokenAmount', token.balance);
      }
    } else {
      setSelectedToken(null);
    }
  }, [watchTokenContract, ownedTokens, setValue, watchTokenAmount]);

  // Update minimum auction duration when listing type changes
  useEffect(() => {
    if (watchListingType === 'auction' && watch('duration') === '0') {
      setValue('duration', '24'); // Default auction duration: 24 hours
    }
  }, [watchListingType, setValue, watch]);

  // Handle next step
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle form submission
  const onSubmit = async (data: CreateListingFormValues) => {
    if (!library || !account || !selectedToken) return;
    
    setSubmitting(true);
    try {
      const marketContract = new ethers.Contract(
        SECONDARY_MARKET_ADDRESS,
        SECONDARY_MARKET_ABI,
        library.getSigner()
      );
      
      // Get token contract to approve the marketplace
      const tokenContract = new ethers.Contract(
        data.tokenContract,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        library.getSigner()
      );
      
      // Convert values
      const tokenAmount = ethers.utils.parseEther(data.tokenAmount);
      const pricePerToken = ethers.utils.parseEther(data.pricePerToken);
      
      // Approve marketplace to transfer tokens
      const approveTx = await tokenContract.approve(SECONDARY_MARKET_ADDRESS, tokenAmount);
      toast.info('Approving marketplace to transfer your tokens...');
      await approveTx.wait();
      
      let tx;
      let result;
      
      if (data.listingType === 'fixed') {
        // For fixed price listings
        const expiresAt = data.duration === '0' 
          ? 0 // No expiration
          : Math.floor(Date.now() / 1000) + (parseInt(data.duration) * 3600); // Hours to seconds
        
        toast.info('Creating fixed price listing...');
        tx = await marketContract.createFixedPriceListing(
          data.tokenContract,
          tokenAmount,
          pricePerToken,
          expiresAt
        );
      } else {
        // For auction listings
        const minBid = ethers.utils.parseEther(data.minBid);
        const duration = parseInt(data.duration) * 3600; // Hours to seconds
        
        toast.info('Creating auction listing...');
        tx = await marketContract.createAuctionListing(
          data.tokenContract,
          tokenAmount,
          pricePerToken, // Starting price
          minBid,
          duration
        );
      }
      
      // Wait for transaction confirmation
      result = await tx.wait();
      
      // Get listing ID from event (in real implementation)
      // For mock, just generate a random ID
      setTransactionHash(tx.hash);
      setListingId(`${Math.floor(Math.random() * 1000)}`);
      
      toast.success(`${data.listingType === 'fixed' ? 'Fixed price' : 'Auction'} listing created successfully!`);
      
      // Move to final step to show confirmation
      setActiveStep(steps.length - 1);
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  // Render step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0: // Select Token Step
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select a Fractionalized Token to List
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : ownedTokens.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                You don't own any fractionalized tokens. Please fractionalize an IP NFT first.
              </Alert>
            ) : (
              <Controller
                name="tokenContract"
                control={control}
                rules={{ required: "Please select a token to list" }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.tokenContract} sx={{ mt: 2 }}>
                    <InputLabel id="token-select-label">Token</InputLabel>
                    <Select
                      {...field}
                      labelId="token-select-label"
                      label="Token"
                    >
                      {ownedTokens.map((token) => (
                        <MenuItem key={token.contractAddress} value={token.contractAddress}>
                          <Box>
                            <Typography variant="subtitle1">
                              {token.name} ({token.symbol})
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Balance: {token.balance} {token.symbol} {token.ipnftId && `• IP NFT #${token.ipnftId}`}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.tokenContract && (
                      <FormHelperText>{errors.tokenContract.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            )}
            
            {selectedToken && (
              <Box mt={3}>
                <Typography variant="subtitle1">Selected Token</Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                  <Stack spacing={1}>
                    <Typography variant="h6">{selectedToken.name}</Typography>
                    <Typography variant="body1">Symbol: {selectedToken.symbol}</Typography>
                    <Typography variant="body1">
                      Available Balance: {selectedToken.balance} {selectedToken.symbol}
                    </Typography>
                    {selectedToken.ipnftId && (
                      <Typography variant="body1">
                        Source IP NFT: #{selectedToken.ipnftId}
                      </Typography>
                    )}
                    <Box mt={1}>
                      <Controller
                        name="tokenAmount"
                        control={control}
                        rules={{ 
                          required: "Amount is required",
                          validate: {
                            positive: v => parseFloat(v) > 0 || "Amount must be greater than 0",
                            notMoreThanBalance: v => parseFloat(v) <= parseFloat(selectedToken.balance) || "Cannot list more than your balance"
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Amount to List"
                            type="number"
                            fullWidth
                            error={!!errors.tokenAmount}
                            helperText={errors.tokenAmount?.message}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">{selectedToken.symbol}</InputAdornment>,
                              inputProps: { min: 0.000001, max: parseFloat(selectedToken.balance), step: 0.000001 }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            )}
          </Box>
        );
      
      case 1: // Listing Details Step
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Listing Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="listingType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value === 'auction'}
                            onChange={(e) => field.onChange(e.target.checked ? 'auction' : 'fixed')}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body1">
                            {field.value === 'auction' ? 'Auction Listing' : 'Fixed Price Listing'}
                          </Typography>
                        }
                      />
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="pricePerToken"
                  control={control}
                  rules={{ 
                    required: "Price is required",
                    validate: {
                      positive: v => parseFloat(v) > 0 || "Price must be greater than 0"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={watchListingType === 'fixed' ? "Price per Token" : "Starting Price per Token"}
                      type="number"
                      fullWidth
                      error={!!errors.pricePerToken}
                      helperText={errors.pricePerToken?.message}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
                        inputProps: { min: 0.000001, step: 0.000001 }
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="duration"
                  control={control}
                  rules={{ 
                    required: "Duration is required",
                    validate: {
                      validAuctionDuration: v => watchListingType !== 'auction' || parseInt(v) > 0 || "Auction must have a duration"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={watchListingType === 'fixed' ? "Duration (0 for no expiry)" : "Duration (hours)"}
                      type="number"
                      fullWidth
                      error={!!errors.duration}
                      helperText={errors.duration?.message}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">
                          <AccessTimeIcon sx={{ mr: 1 }} /> Hours
                        </InputAdornment>,
                        inputProps: { 
                          min: watchListingType === 'auction' ? 1 : 0, 
                          step: 1 
                        }
                      }}
                    />
                  )}
                />
              </Grid>
              
              {watchListingType === 'auction' && (
                <Grid item xs={12} md={6}>
                  <Controller
                    name="minBid"
                    control={control}
                    rules={{ 
                      required: "Minimum bid increment is required",
                      validate: {
                        positive: v => parseFloat(v) > 0 || "Minimum bid must be greater than 0"
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Minimum Bid Increment"
                        type="number"
                        fullWidth
                        error={!!errors.minBid}
                        helperText={errors.minBid?.message}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
                          inputProps: { min: 0.000001, step: 0.000001 }
                        }}
                      />
                    )}
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    {watchListingType === 'fixed' 
                      ? `Your tokens will be listed at ${watch('pricePerToken') || '0'} ETH per token.${
                          watch('duration') === '0' 
                            ? ' The listing will not expire until filled or cancelled.' 
                            : ` The listing will expire after ${watch('duration')} hours.`
                        }`
                      : `Your tokens will be auctioned with a starting price of ${watch('pricePerToken') || '0'} ETH per token. 
                         The auction will run for ${watch('duration')} hours, with a minimum bid increment of ${watch('minBid') || '0'} ETH.`
                    }
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 2: // Review & Submit Step
        if (transactionHash) {
          return (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Listing created successfully!
              </Alert>
              
              <Typography variant="h6" gutterBottom>
                Listing Summary
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Transaction Hash</Typography>
                    <Typography variant="body1" gutterBottom>
                      {transactionHash.substring(0, 10)}...{transactionHash.substring(transactionHash.length - 8)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Listing ID</Typography>
                    <Typography variant="body1" gutterBottom>#{listingId}</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Token</Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedToken?.name} ({selectedToken?.symbol})
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Amount Listed</Typography>
                    <Typography variant="body1" gutterBottom>
                      {watch('tokenAmount')} {selectedToken?.symbol}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Listing Type</Typography>
                    <Typography variant="body1" gutterBottom>
                      {watch('listingType') === 'fixed' ? 'Fixed Price' : 'Auction'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="center" mt={2}>
                      <Button 
                        variant="contained" 
                        onClick={() => {
                          // Navigate to marketplace
                          window.location.href = '/marketplace';
                        }}
                      >
                        Go to Marketplace
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          );
        }
        
        const formData = watch();
        const expiryText = formData.listingType === 'fixed' 
          ? (formData.duration === '0' ? 'No expiry' : `${formData.duration} hours`) 
          : `${formData.duration} hours`;
        
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Listing Details
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Token Information</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Token</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedToken?.name} ({selectedToken?.symbol})
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Amount</Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.tokenAmount} {selectedToken?.symbol}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Listing Information</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Listing Type</Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.listingType === 'fixed' ? 'Fixed Price' : 'Auction'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Price</Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.pricePerToken} ETH per token
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Duration</Typography>
                  <Typography variant="body1" gutterBottom>{expiryText}</Typography>
                </Grid>
                
                {formData.listingType === 'auction' && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Minimum Bid Increment</Typography>
                    <Typography variant="body1" gutterBottom>{formData.minBid} ETH</Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Total Value</Typography>
                  <Typography variant="h6" gutterBottom>
                    {(parseFloat(formData.tokenAmount) * parseFloat(formData.pricePerToken)).toFixed(6)} ETH
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              You'll need to approve the marketplace contract to transfer your tokens before the listing is created.
            </Alert>
          </Box>
        );
      
      default:
        return "Unknown step";
    }
  };

  return (
    <Container maxWidth="md">
      <Card>
        <CardHeader 
          title="Create New Listing" 
          subheader="List your fractionalized IP NFT tokens on the marketplace"
        />
        <Divider />
        
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0 || submitting || transactionHash !== null}
                onClick={handleBack}
              >
                Back
              </Button>
              
              <Box>
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={
                      (activeStep === 0 && (!watchTokenContract || !watch('tokenAmount') || !!errors.tokenAmount)) ||
                      (activeStep === 1 && (!watch('pricePerToken') || !!errors.pricePerToken || !!errors.duration)) ||
                      submitting
                    }
                  >
                    Next
                  </Button>
                ) : (
                  !transactionHash && (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={24} sx={{ mr: 1 }} />
                          Creating Listing...
                        </Box>
                      ) : (
                        'Create Listing'
                      )}
                    </Button>
                  )
                )}
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateListingForm; 