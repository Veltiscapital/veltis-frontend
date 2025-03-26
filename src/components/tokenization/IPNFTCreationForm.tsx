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
  Stack, 
  TextField, 
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ethers } from 'ethers';
import { IP_TYPES, DEVELOPMENT_STAGES } from '../../lib/config';
import { mintIPNFT, calculateMintFee } from '../../lib/blockchain';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'sonner';

// Type for form values
type IPNFTFormValues = {
  title: string;
  authors: string;
  institution: string;
  filingDate: Date | null;
  expirationDate: Date | null;
  ipType: string;
  developmentStage: string;
  description: string;
  valuation: string;
  royaltyPercentage: string;
  royaltyRecipient: string;
  digitalFingerprint: string;
};

// IPFS mock function - would be replaced with actual implementation
const uploadToIPFS = async (file: File): Promise<string> => {
  // Mock implementation - would be replaced with actual IPFS upload
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomCID = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      resolve(randomCID);
    }, 2000);
  });
};

// Generate token metadata in JSON format
const generateTokenMetadata = (values: IPNFTFormValues, ipfsCID: string): string => {
  const metadata = {
    name: values.title,
    description: values.description,
    image: `ipfs://${ipfsCID}`,
    attributes: [
      {
        trait_type: 'IP Type',
        value: values.ipType
      },
      {
        trait_type: 'Development Stage',
        value: values.developmentStage
      },
      {
        trait_type: 'Institution',
        value: values.institution
      },
      {
        trait_type: 'Authors',
        value: values.authors
      },
      {
        display_type: 'date',
        trait_type: 'Filing Date',
        value: values.filingDate ? Math.floor(new Date(values.filingDate).getTime() / 1000) : null
      },
      {
        display_type: 'date',
        trait_type: 'Expiration Date',
        value: values.expirationDate ? Math.floor(new Date(values.expirationDate).getTime() / 1000) : null
      },
      {
        display_type: 'number',
        trait_type: 'Valuation',
        value: values.valuation
      }
    ]
  };
  
  return JSON.stringify(metadata);
};

// Steps for the stepper
const steps = ['Enter IP Details', 'Upload Documents', 'Set Valuation & Royalties', 'Review & Submit'];

const IPNFTCreationForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [ipfsCID, setIpfsCID] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mintFeeEstimate, setMintFeeEstimate] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  
  const { control, handleSubmit, watch, formState: { errors }, setValue, getValues } = useForm<IPNFTFormValues>({
    defaultValues: {
      title: '',
      authors: '',
      institution: '',
      filingDate: null,
      expirationDate: null,
      ipType: '',
      developmentStage: '',
      description: '',
      valuation: '',
      royaltyPercentage: '2.5',
      royaltyRecipient: '',
      digitalFingerprint: ''
    }
  });
  
  const watchValuation = watch('valuation');
  
  // Update mint fee estimate when valuation changes
  useEffect(() => {
    const updateMintFee = async () => {
      if (watchValuation && !isNaN(Number(watchValuation))) {
        try {
          setLoading(true);
          const valuationInWei = ethers.utils.parseEther(watchValuation);
          const fee = await calculateMintFee(valuationInWei);
          setMintFeeEstimate(ethers.utils.formatEther(fee));
        } catch (error) {
          console.error('Error calculating mint fee:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setMintFeeEstimate('0');
      }
    };
    
    updateMintFee();
  }, [watchValuation]);
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Generate a simple checksum for the file
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          const arrayBuffer = e.target.result as ArrayBuffer;
          const array = new Uint8Array(arrayBuffer);
          let hash = 0;
          for (let i = 0; i < array.length; i++) {
            hash = ((hash << 5) - hash) + array[i];
            hash |= 0;
          }
          setValue('digitalFingerprint', hash.toString(16));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };
  
  const handleUploadToIPFS = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    try {
      setUploading(true);
      const cid = await uploadToIPFS(selectedFile);
      setIpfsCID(cid);
      toast.success('File uploaded to IPFS successfully');
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      toast.error('Failed to upload file to IPFS');
    } finally {
      setUploading(false);
    }
  };
  
  const onSubmit = async (data: IPNFTFormValues) => {
    if (!ipfsCID) {
      toast.error('Please upload a document to IPFS first');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Generate token metadata
      const tokenMetadata = generateTokenMetadata(data, ipfsCID);
      
      // Upload metadata to IPFS (mock)
      const metadataCID = await uploadToIPFS(new Blob([tokenMetadata], { type: 'application/json' }));
      const tokenURI = `ipfs://${metadataCID}`;
      
      // Convert dates to unix timestamps
      const filingDate = data.filingDate 
        ? Math.floor(new Date(data.filingDate).getTime() / 1000) 
        : 0;
        
      const expirationDate = data.expirationDate 
        ? Math.floor(new Date(data.expirationDate).getTime() / 1000) 
        : 0;
      
      // Convert valuation to wei
      const valuationInWei = ethers.utils.parseEther(data.valuation);
      
      // Convert royalty percentage to basis points
      const royaltyPercentageBPS = Math.floor(parseFloat(data.royaltyPercentage) * 100);
      
      // Get current address for royalty recipient if not specified
      const royaltyRecipient = data.royaltyRecipient || await window.ethereum.request({ method: 'eth_requestAccounts' }).then((accounts: string[]) => accounts[0]);
      
      // Calculate mint fee
      const mintFee = await calculateMintFee(valuationInWei);
      
      // Mint the IPNFT
      const result = await mintIPNFT(
        await window.ethereum.request({ method: 'eth_requestAccounts' }).then((accounts: string[]) => accounts[0]),
        tokenURI,
        data.title,
        data.authors,
        data.institution,
        filingDate,
        expirationDate,
        ipfsCID,
        data.ipType,
        data.developmentStage,
        data.digitalFingerprint,
        royaltyRecipient,
        royaltyPercentageBPS,
        valuationInWei
      );
      
      setTxHash(result.transactionHash);
      toast.success('IP-NFT minted successfully');
      handleNext();
    } catch (error) {
      console.error('Error minting IP-NFT:', error);
      toast.error('Failed to mint IP-NFT');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader 
        title="Create Intellectual Property NFT" 
        subheader="Tokenize your biotech intellectual property as an NFT"
      />
      <Divider />
      
      <CardContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Title is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="IP Title"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: 'Description is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="authors"
                  control={control}
                  rules={{ required: 'Authors are required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Authors"
                      fullWidth
                      error={!!errors.authors}
                      helperText={errors.authors?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="institution"
                  control={control}
                  rules={{ required: 'Institution is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Institution"
                      fullWidth
                      error={!!errors.institution}
                      helperText={errors.institution?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="ipType"
                  control={control}
                  rules={{ required: 'IP Type is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.ipType}>
                      <InputLabel>IP Type</InputLabel>
                      <Select {...field} label="IP Type">
                        {IP_TYPES.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.ipType && (
                        <FormHelperText>{errors.ipType.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="developmentStage"
                  control={control}
                  rules={{ required: 'Development Stage is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.developmentStage}>
                      <InputLabel>Development Stage</InputLabel>
                      <Select {...field} label="Development Stage">
                        {DEVELOPMENT_STAGES.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.developmentStage && (
                        <FormHelperText>{errors.developmentStage.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Controller
                    name="filingDate"
                    control={control}
                    rules={{ required: 'Filing Date is required' }}
                    render={({ field }) => (
                      <DatePicker
                        label="Filing Date"
                        value={field.value}
                        onChange={(newValue) => field.onChange(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.filingDate,
                            helperText: errors.filingDate?.message
                          }
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Controller
                    name="expirationDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Expiration Date (Optional)"
                        value={field.value}
                        onChange={(newValue) => field.onChange(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.expirationDate,
                            helperText: errors.expirationDate?.message
                          }
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          )}
          
          {activeStep === 1 && (
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 4 }}>
                <Typography variant="h6">Upload IP Documentation</Typography>
                <Typography variant="body2" color="text.secondary">
                  Please upload all relevant IP documentation. Supported files: PDF, DOC, DOCX, JPG, PNG
                </Typography>
                
                <Box
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    width: '100%',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    Drag & Drop or Click to Upload
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedFile ? selectedFile.name : 'No file selected'}
                  </Typography>
                </Box>
                
                <Button
                  variant="contained"
                  startIcon={ipfsCID ? <CheckCircleIcon /> : <FileUploadIcon />}
                  onClick={handleUploadToIPFS}
                  disabled={!selectedFile || uploading || !!ipfsCID}
                  color={ipfsCID ? 'success' : 'primary'}
                >
                  {uploading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Uploading...
                    </>
                  ) : ipfsCID ? (
                    'Document Uploaded'
                  ) : (
                    'Upload to IPFS'
                  )}
                </Button>
                
                {ipfsCID && (
                  <Alert severity="success" sx={{ width: '100%' }}>
                    <Typography variant="body2">
                      Document uploaded to IPFS with CID: {ipfsCID}
                    </Typography>
                  </Alert>
                )}
              </Box>
              
              <Controller
                name="digitalFingerprint"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Digital Fingerprint (Auto-generated)"
                    fullWidth
                    disabled
                    sx={{ mb: 2 }}
                  />
                )}
              />
            </Box>
          )}
          
          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Set Valuation & Royalties
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Specify the valuation of your IP and set royalty parameters for future transactions.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="valuation"
                  control={control}
                  rules={{ 
                    required: 'Valuation is required',
                    pattern: {
                      value: /^[0-9]*\.?[0-9]+$/,
                      message: 'Please enter a valid number'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="IP Valuation"
                      fullWidth
                      type="text"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">ETH</InputAdornment>
                      }}
                      error={!!errors.valuation}
                      helperText={errors.valuation?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="royaltyPercentage"
                  control={control}
                  rules={{ 
                    required: 'Royalty percentage is required',
                    pattern: {
                      value: /^[0-9]*\.?[0-9]+$/,
                      message: 'Please enter a valid number'
                    },
                    max: {
                      value: 50,
                      message: 'Maximum royalty is 50%'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Royalty Percentage"
                      fullWidth
                      type="text"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                      error={!!errors.royaltyPercentage}
                      helperText={errors.royaltyPercentage?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="royaltyRecipient"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Royalty Recipient Address (Optional, defaults to your address)"
                      fullWidth
                      error={!!errors.royaltyRecipient}
                      helperText={errors.royaltyRecipient?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Estimated mint fee: {mintFeeEstimate} ETH
                    {loading && <CircularProgress size={14} sx={{ ml: 1 }} />}
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          )}
          
          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Review Your IP-NFT Information
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">IP Title</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {watch('title')}
                  </Typography>
                  
                  <Typography variant="subtitle2">Authors</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {watch('authors')}
                  </Typography>
                  
                  <Typography variant="subtitle2">Institution</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {watch('institution')}
                  </Typography>
                  
                  <Typography variant="subtitle2">IP Type</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {watch('ipType')}
                  </Typography>
                  
                  <Typography variant="subtitle2">Development Stage</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {watch('developmentStage')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Filing Date</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {watch('filingDate') ? new Date(watch('filingDate')).toLocaleDateString() : 'N/A'}
                  </Typography>
                  
                  <Typography variant="subtitle2">Expiration Date</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {watch('expirationDate') ? new Date(watch('expirationDate')).toLocaleDateString() : 'N/A'}
                  </Typography>
                  
                  <Typography variant="subtitle2">Valuation</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {watch('valuation')} ETH
                  </Typography>
                  
                  <Typography variant="subtitle2">Royalty Percentage</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {watch('royaltyPercentage')}%
                  </Typography>
                  
                  <Typography variant="subtitle2">IPFS Document CID</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {ipfsCID}
                  </Typography>
                </Grid>
              </Grid>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Mint Fee: {mintFeeEstimate} ETH
                </Typography>
              </Alert>
              
              {txHash && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Transaction successful! Transaction hash: {txHash}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0 || submitting}
              onClick={handleBack}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={submitting || !!txHash}
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Minting...
                    </>
                  ) : txHash ? (
                    'Minted Successfully'
                  ) : (
                    'Mint IP-NFT'
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={
                    (activeStep === 0 && Object.keys(errors).some(k => ['title', 'authors', 'institution', 'ipType', 'developmentStage', 'filingDate', 'description'].includes(k))) ||
                    (activeStep === 1 && !ipfsCID) ||
                    (activeStep === 2 && (!watch('valuation') || !watch('royaltyPercentage') || !!errors.valuation || !!errors.royaltyPercentage))
                  }
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default IPNFTCreationForm; 