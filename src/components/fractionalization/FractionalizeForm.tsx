import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CircularProgress, 
  Divider, 
  FormControl, 
  FormHelperText, 
  Grid, 
  InputAdornment, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField, 
  Typography,
  Alert,
  Paper,
  Stack
} from '@mui/material';
import { ethers } from 'ethers';
import { 
  fractionalizeIPNFT, 
  getOwnedIPNFTs,
  isIPNFTFractionalized
} from '../../lib/blockchain';
import { toast } from 'sonner';

// Form types
type FractionalizeFormValues = {
  ipnftTokenId: string;
  name: string;
  symbol: string;
  totalShares: string;
  initialPrice: string;
  description: string;
};

// Owned IPNFT type
type OwnedIPNFT = {
  id: string;
  title: string;
  ipType: string;
  developmentStage: string;
  valuation: string;
};

const FractionalizeForm = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ownedIPNFTs, setOwnedIPNFTs] = useState<OwnedIPNFT[]>([]);
  const [selectedIPNFT, setSelectedIPNFT] = useState<OwnedIPNFT | null>(null);
  const [txHash, setTxHash] = useState<string>('');
  const [fractionalAddress, setFractionalAddress] = useState<string>('');
  
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FractionalizeFormValues>({
    defaultValues: {
      ipnftTokenId: '',
      name: '',
      symbol: '',
      totalShares: '1000',
      initialPrice: '',
      description: ''
    }
  });
  
  const watchTokenId = watch('ipnftTokenId');
  
  // Load owned IPNFTs
  useEffect(() => {
    const fetchOwnedIPNFTs = async () => {
      try {
        setLoading(true);
        const ipnfts = await getOwnedIPNFTs();
        
        // Filter out already fractionalized IPNFTs
        const nonFractionalized = await Promise.all(
          ipnfts.map(async (ipnft) => {
            const isAlreadyFractionalized = await isIPNFTFractionalized(
              process.env.REACT_APP_IPNFT_CONTRACT_ADDRESS || '', 
              ipnft.id
            );
            return { ipnft, isAlreadyFractionalized };
          })
        );
        
        const availableIPNFTs = nonFractionalized
          .filter(({ isAlreadyFractionalized }) => !isAlreadyFractionalized)
          .map(({ ipnft }) => ipnft);
            
        setOwnedIPNFTs(availableIPNFTs);
      } catch (error) {
        console.error('Error fetching owned IPNFTs:', error);
        toast.error('Failed to load your IP NFTs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOwnedIPNFTs();
  }, []);
  
  // Update selected IPNFT when token ID changes
  useEffect(() => {
    if (watchTokenId) {
      const found = ownedIPNFTs.find(ipnft => ipnft.id === watchTokenId);
      setSelectedIPNFT(found || null);
      
      // Auto-generate name and symbol based on title
      if (found) {
        const shortTitle = found.title.substring(0, 20);
        setValue('name', `${shortTitle} Shares`);
        
        // Generate a symbol from the first letter of each word
        const symbol = found.title
          .split(' ')
          .map(word => word.charAt(0).toUpperCase())
          .join('');
          
        setValue('symbol', symbol.substring(0, 6));
      }
    } else {
      setSelectedIPNFT(null);
    }
  }, [watchTokenId, ownedIPNFTs, setValue]);
  
  const onSubmit = async (data: FractionalizeFormValues) => {
    if (!selectedIPNFT) {
      toast.error('Please select an IP NFT to fractionalize');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Convert values to appropriate formats
      const totalShares = ethers.utils.parseUnits(data.totalShares, 0);
      const initialPrice = ethers.utils.parseEther(data.initialPrice);
      const ipnftContractAddress = process.env.REACT_APP_IPNFT_CONTRACT_ADDRESS || '';
      
      // Call fractionalization function
      const result = await fractionalizeIPNFT(
        ipnftContractAddress,
        data.ipnftTokenId,
        data.name,
        data.symbol,
        data.totalShares,
        initialPrice
      );
      
      setTxHash(result.transactionHash);
      setFractionalAddress(result.fractionalizationAddress);
      toast.success('IP NFT fractionalized successfully');
    } catch (error) {
      console.error('Error fractionalizing IP NFT:', error);
      toast.error('Failed to fractionalize IP NFT');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader 
        title="Fractionalize IP NFT" 
        subheader="Convert your intellectual property into tradable shares"
      />
      <Divider />
      
      <CardContent>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : ownedIPNFTs.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            You don't have any IP NFTs available for fractionalization. Please create an IP NFT first.
          </Alert>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* IPNFT Selection */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Select an IP NFT to Fractionalize
                </Typography>
                
                <Controller
                  name="ipnftTokenId"
                  control={control}
                  rules={{ required: 'You must select an IP NFT' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.ipnftTokenId}>
                      <InputLabel>IP NFT</InputLabel>
                      <Select {...field} label="IP NFT">
                        {ownedIPNFTs.map((ipnft) => (
                          <MenuItem key={ipnft.id} value={ipnft.id}>
                            {ipnft.title} (ID: {ipnft.id})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.ipnftTokenId && (
                        <FormHelperText>{errors.ipnftTokenId.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              {/* Selected IPNFT Details */}
              {selectedIPNFT && (
                <Grid item xs={12}>
                  <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected IP NFT Details
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Title:</Typography>
                        <Typography variant="body1" gutterBottom>{selectedIPNFT.title}</Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">IP Type:</Typography>
                        <Typography variant="body1" gutterBottom>{selectedIPNFT.ipType}</Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Development Stage:</Typography>
                        <Typography variant="body1" gutterBottom>{selectedIPNFT.developmentStage}</Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Valuation:</Typography>
                        <Typography variant="body1" gutterBottom>{selectedIPNFT.valuation} ETH</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
              
              {/* Fractionalization Parameters */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Fractionalization Parameters
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Token name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Token Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="symbol"
                  control={control}
                  rules={{ 
                    required: 'Token symbol is required',
                    maxLength: { value: 6, message: 'Symbol should be 6 characters or less' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Token Symbol"
                      fullWidth
                      error={!!errors.symbol}
                      helperText={errors.symbol?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Token Description (Optional)"
                      fullWidth
                      multiline
                      rows={2}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="totalShares"
                  control={control}
                  rules={{ 
                    required: 'Total shares are required',
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Please enter a valid whole number'
                    },
                    min: {
                      value: 1,
                      message: 'Shares must be at least 1'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Total Shares"
                      fullWidth
                      type="text"
                      error={!!errors.totalShares}
                      helperText={errors.totalShares?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="initialPrice"
                  control={control}
                  rules={{ 
                    required: 'Initial price is required',
                    pattern: {
                      value: /^[0-9]*\.?[0-9]+$/,
                      message: 'Please enter a valid number'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Initial Price per Share"
                      fullWidth
                      type="text"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">ETH</InputAdornment>
                      }}
                      error={!!errors.initialPrice}
                      helperText={errors.initialPrice?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Fractionalizing your IP NFT will create ERC-20 tokens that represent partial ownership of your intellectual property.
                    You will receive {watch('totalShares') || '0'} shares at an initial price of {watch('initialPrice') || '0'} ETH each.
                  </Typography>
                </Alert>
              </Grid>
              
              {txHash && (
                <Grid item xs={12}>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        Fractionalization successful!
                      </Typography>
                      <Typography variant="body2">
                        Transaction hash: {txHash}
                      </Typography>
                      {fractionalAddress && (
                        <Typography variant="body2">
                          Fractional token contract: {fractionalAddress}
                        </Typography>
                      )}
                    </Stack>
                  </Alert>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Fractionalizing...
                      </>
                    ) : (
                      'Fractionalize'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default FractionalizeForm; 