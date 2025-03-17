import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, Upload, FileText, AlertCircle, Check } from 'lucide-react';
import { uploadFileToIPFS, uploadNFTMetadata } from '@/lib/nft-storage';
import { mintSimpleIPNFT } from '@/lib/blockchain';
import { ethers } from 'ethers';
import { IP_TYPES, DEVELOPMENT_STAGES } from '@/lib/config';

interface MintFormData {
  name: string;
  description: string;
  ipType: string;
  developmentStage: string;
  authors: string;
  institution: string;
}

enum MintingStep {
  IDLE = 'idle',
  UPLOADING_TO_IPFS = 'uploading_to_ipfs',
  CREATING_METADATA = 'creating_metadata',
  MINTING_ON_BLOCKCHAIN = 'minting_on_blockchain',
  CONFIRMING_TRANSACTION = 'confirming_transaction',
  SUCCESS = 'success',
  ERROR = 'error'
}

export default function MintIPNFT() {
  const navigate = useNavigate();
  const { isAuthenticated, walletAddress, connectWallet } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [mintingStep, setMintingStep] = useState<MintingStep>(MintingStep.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<MintFormData>({
    defaultValues: {
      name: '',
      description: '',
      ipType: '',
      developmentStage: '',
      authors: '',
      institution: '',
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    onDropRejected: (rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === 'file-too-large') {
          toast.error('File is too large. Maximum size is 10MB.');
        } else {
          toast.error(`File rejected: ${error.message}`);
        }
      }
    },
  });

  const mintMutation = useMutation({
    mutationFn: async (data: MintFormData) => {
      try {
        if (!walletAddress) {
          throw new Error('Wallet not connected');
        }
        
        if (!file) {
          throw new Error('No file selected');
        }
        
        // Reset error state
        setErrorMessage(null);
        
        // Step 1: Upload file to IPFS
        setMintingStep(MintingStep.UPLOADING_TO_IPFS);
        
        // Create a proper File object that NFT.storage can handle
        // This ensures we're passing a valid File object to the NFT.storage API
        const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });
        const ipfsFile = new File([fileBlob], file.name, { type: file.type });
        
        // Step 2: Create and upload metadata
        setMintingStep(MintingStep.CREATING_METADATA);
        
        try {
          const metadataUri = await uploadNFTMetadata(
            {
              name: data.name,
              description: data.description,
              properties: {
                ipType: data.ipType,
                developmentStage: data.developmentStage,
                authors: data.authors,
                institution: data.institution || '',
                createdAt: new Date().toISOString(),
              }
            },
            ipfsFile
          );
          
          // Step 3: Mint the NFT on the blockchain
          setMintingStep(MintingStep.MINTING_ON_BLOCKCHAIN);
          const filingDate = Math.floor(Date.now() / 1000); // Current timestamp in seconds
          const valuation = ethers.utils.parseEther('1'); // 1 MATIC in wei
          
          // Call the blockchain function to mint the NFT
          const tx = await mintSimpleIPNFT(
            walletAddress,
            metadataUri,
            data.name,
            data.authors,
            data.institution || '',
            filingDate,
            '', // ipfsDocumentCID is included in the metadata
            data.ipType,
            valuation
          );
          
          // Save transaction hash
          setTransactionHash(tx.transactionHash);
          
          // Save token ID
          if (tx.tokenId) {
            setTokenId(tx.tokenId);
          }
          
          // Step 4: Wait for confirmation
          setMintingStep(MintingStep.CONFIRMING_TRANSACTION);
          
          // Wait for the transaction to be confirmed (simulated with timeout)
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Step 5: Success
          setMintingStep(MintingStep.SUCCESS);
          
          return {
            tokenId: tx.tokenId,
            transactionHash: tx.transactionHash,
            metadataUri
          };
        } catch (error) {
          console.error('NFT metadata upload error:', error);
          if (error instanceof Error) {
            throw new Error(`Failed to upload NFT metadata to IPFS: ${error.message}`);
          }
          throw new Error('Failed to upload NFT metadata to IPFS');
        }
      } catch (error) {
        console.error('Mint error:', error);
        setMintingStep(MintingStep.ERROR);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to mint IP-NFT');
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success('IP-NFT minted successfully!');
      // Navigate to the IP-NFT detail page after a short delay
      setTimeout(() => {
        navigate(`/dashboard/ipnft/${data.tokenId}`);
      }, 2000);
    },
    onError: (error) => {
      console.error('Mint error:', error);
      toast.error('Failed to mint IP-NFT. Please try again.');
      setMintingStep(MintingStep.ERROR);
    }
  });

  const onSubmit = async (data: MintFormData) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to mint an IP-NFT');
      return;
    }

    if (!walletAddress) {
      try {
        await connectWallet();
      } catch (error) {
        toast.error('Please connect your wallet to mint an IP-NFT');
        return;
      }
    }

    if (!file) {
      toast.error('Please upload a document');
      return;
    }

    mintMutation.mutate(data);
  };

  // Check if form is valid
  const isFormValid = () => {
    return watch('name') && 
           watch('description') && 
           watch('ipType') && 
           watch('developmentStage') && 
           watch('authors') && 
           file;
  };

  // Render minting status
  const renderMintingStatus = () => {
    if (mintingStep === MintingStep.IDLE) return null;
    
    let title = '';
    let description = '';
    let icon = <Loader2 className="h-4 w-4 animate-spin" />;
    
    switch (mintingStep) {
      case MintingStep.UPLOADING_TO_IPFS:
        title = 'Uploading to IPFS';
        description = 'Your document is being uploaded to IPFS...';
        break;
      case MintingStep.CREATING_METADATA:
        title = 'Creating Metadata';
        description = 'Creating and uploading metadata to IPFS...';
        break;
      case MintingStep.MINTING_ON_BLOCKCHAIN:
        title = 'Minting IP-NFT';
        description = 'Creating your IP-NFT on the blockchain...';
        break;
      case MintingStep.CONFIRMING_TRANSACTION:
        title = 'Confirming Transaction';
        description = 'Waiting for blockchain confirmation...';
        break;
      case MintingStep.SUCCESS:
        title = 'Minting Successful';
        description = `Your IP-NFT has been successfully minted! Token ID: ${tokenId}`;
        icon = <Check className="h-4 w-4 text-green-500" />;
        break;
      case MintingStep.ERROR:
        title = 'Minting Failed';
        description = errorMessage || 'An error occurred while minting your IP-NFT.';
        icon = <AlertCircle className="h-4 w-4 text-red-500" />;
        break;
    }
    
    return (
      <Alert className={`mb-6 ${mintingStep === MintingStep.ERROR ? 'border-red-500' : ''}`}>
        {icon}
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {description}
          {transactionHash && (mintingStep === MintingStep.CONFIRMING_TRANSACTION || mintingStep === MintingStep.SUCCESS) && (
            <div className="mt-2">
              <a 
                href={`https://amoy.polygonscan.com/tx/${transactionHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline text-sm"
              >
                View transaction on PolygonScan
              </a>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mint IP-NFT</h1>
        <p className="text-muted-foreground">
          Create a new intellectual property NFT by filling out the form below
        </p>
      </div>

      {!isAuthenticated && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to sign in and connect your wallet to mint an IP-NFT.
          </AlertDescription>
        </Alert>
      )}

      {isAuthenticated && !walletAddress && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Wallet Connection Required</AlertTitle>
          <AlertDescription>
            Please connect your wallet to mint an IP-NFT.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={() => connectWallet()}
            >
              Connect Wallet
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {renderMintingStatus()}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter IP-NFT name"
                {...register('name', { required: 'Name is required' })}
                disabled={mintingStep !== MintingStep.IDLE}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your intellectual property"
                className="min-h-[120px]"
                {...register('description', { required: 'Description is required' })}
                disabled={mintingStep !== MintingStep.IDLE}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ipType">IP Type</Label>
              <Select
                onValueChange={(value) => setValue('ipType', value)}
                defaultValue={watch('ipType')}
                disabled={mintingStep !== MintingStep.IDLE}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select IP type" />
                </SelectTrigger>
                <SelectContent>
                  {IP_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ipType && (
                <p className="text-sm text-red-500 mt-1">{errors.ipType.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="developmentStage">Development Stage</Label>
              <Select
                onValueChange={(value) => setValue('developmentStage', value)}
                defaultValue={watch('developmentStage')}
                disabled={mintingStep !== MintingStep.IDLE}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select development stage" />
                </SelectTrigger>
                <SelectContent>
                  {DEVELOPMENT_STAGES.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.developmentStage && (
                <p className="text-sm text-red-500 mt-1">{errors.developmentStage.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="authors">Authors</Label>
              <Input
                id="authors"
                placeholder="Enter authors (comma separated)"
                {...register('authors', { required: 'Authors are required' })}
                disabled={mintingStep !== MintingStep.IDLE}
              />
              {errors.authors && (
                <p className="text-sm text-red-500 mt-1">{errors.authors.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="institution">Institution (Optional)</Label>
              <Input
                id="institution"
                placeholder="Enter institution or organization"
                {...register('institution')}
                disabled={mintingStep !== MintingStep.IDLE}
              />
            </div>
          </div>
        </div>

        <div>
          <Label>Upload Document</Label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 mt-2 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
            } ${mintingStep !== MintingStep.IDLE ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} disabled={mintingStep !== MintingStep.IDLE} />
            {file ? (
              <div className="flex flex-col items-center">
                <FileText className="h-10 w-10 text-primary mb-2" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {mintingStep === MintingStep.IDLE && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="font-medium">Drag & drop your document here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports PDF, DOC, DOCX, JPG, PNG (max 10MB)
                </p>
                <Button type="button" variant="outline" size="sm" className="mt-2">
                  Browse Files
                </Button>
              </div>
            )}
          </div>
          {!file && (
            <p className="text-sm text-muted-foreground mt-2">
              This document will be stored on IPFS and linked to your IP-NFT
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!isFormValid() || mintingStep !== MintingStep.IDLE}
            className="w-full md:w-auto"
          >
            {mintingStep !== MintingStep.IDLE ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Mint IP-NFT'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 