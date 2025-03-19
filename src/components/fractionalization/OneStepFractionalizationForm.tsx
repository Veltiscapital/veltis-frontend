import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, AlertCircle, Check, Info } from 'lucide-react';
import { ethers } from 'ethers';
import { createAndFractionalize } from '@/lib/blockchain';

interface OneStepFractionalizationFormProps {
  onSuccess?: (data: { fractionalizationContract: string, tokenId: string }) => void;
  onCancel?: () => void;
}

enum FractionalizationStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

const OneStepFractionalizationForm: React.FC<OneStepFractionalizationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { walletAddress } = useAuth();
  const [status, setStatus] = useState<FractionalizationStatus>(FractionalizationStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [fractionalizationContract, setFractionalizationContract] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    defaultValues: {
      ipNftName: 'Veltis IP NFT',
      ipNftSymbol: 'VIPNFT',
      tokenURI: 'ipfs://bafkreiabag3ztnhe5pg7js3cqpqdcn4ngblomfyjaxpyrqr33vch5jfafm',
      fractionName: 'Veltis Fraction',
      fractionSymbol: 'VFRAC',
      description: 'Fractional ownership of intellectual property',
      totalShares: '1000',
      initialPrice: '0.01',
      metadata: JSON.stringify({
        title: 'My Intellectual Property',
        description: 'This is a description of my IP',
        authors: 'John Doe, Jane Smith',
        type: 'Patent',
        developmentStage: 'Discovery'
      }, null, 2)
    },
    mode: 'onChange',
  });

  const handleInputChange = () => {
    if (status === FractionalizationStatus.ERROR) {
      setStatus(FractionalizationStatus.IDLE);
      setErrorMessage(null);
    }
  };

  const validateForm = (): boolean => {
    // Check if wallet is connected
    if (!walletAddress) {
      setErrorMessage('Please connect your wallet to fractionalize your IP-NFT');
      return false;
    }
    
    // Check if the form is valid
    if (!isValid) {
      setErrorMessage('Please fill out all required fields correctly');
      return false;
    }
    
    // Reset error message
    setErrorMessage(null);
    return true;
  };

  const onSubmit = async (data: any) => {
    if (!validateForm()) return;
    
    try {
      // Reset error state
      setErrorMessage(null);
      
      // Start the fractionalization process
      setStatus(FractionalizationStatus.PROCESSING);
      
      // Call the createAndFractionalize function
      const result = await createAndFractionalize(
        data.fractionName,
        data.fractionSymbol,
        data.tokenURI,
        data.ipNftSymbol,
        data.totalShares,
        data.initialPrice,
        data.metadata
      );
      
      // Store transaction details
      setTransactionHash(result.transactionHash);
      setFractionalizationContract(result.fractionalizationContract);
      setTokenId(result.tokenId);
      
      // Complete the process
      setStatus(FractionalizationStatus.SUCCESS);
      
      // Call the onSuccess callback
      if (onSuccess) {
        onSuccess({
          fractionalizationContract: result.fractionalizationContract,
          tokenId: result.tokenId
        });
      }
      
    } catch (error) {
      console.error('One-step fractionalization error:', error);
      setStatus(FractionalizationStatus.ERROR);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create and fractionalize IP-NFT');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const renderStatusContent = () => {
    switch (status) {
      case FractionalizationStatus.PROCESSING:
        return (
          <Alert className="mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Creating and Fractionalizing</AlertTitle>
            <AlertDescription>
              Creating and fractionalizing your IP-NFT in one transaction...
              {transactionHash && (
                <div className="mt-2">
                  <a 
                    href={`http://localhost:8545/${transactionHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline text-sm"
                  >
                    View transaction details
                  </a>
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      
      case FractionalizationStatus.SUCCESS:
        return (
          <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <Check className="h-4 w-4 text-green-700 dark:text-green-400" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your IP-NFT has been successfully created and fractionalized.
              <div className="mt-2">
                <div><strong>Token ID:</strong> {tokenId}</div>
                <div><strong>Fractionalization Contract:</strong> {fractionalizationContract}</div>
              </div>
            </AlertDescription>
          </Alert>
        );
      
      case FractionalizationStatus.ERROR:
        return (
          <Alert className="mb-4 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-400" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {errorMessage || 'There was an error creating and fractionalizing your IP-NFT.'}
            </AlertDescription>
          </Alert>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} onChange={handleInputChange}>
        {renderStatusContent()}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">IP-NFT Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="ipNftName">IP-NFT Name</Label>
              <Input
                id="ipNftName"
                placeholder="e.g., Novel Drug Delivery System"
                {...register("ipNftName", { required: true })}
                className={errors.ipNftName ? "border-red-500" : ""}
              />
              {errors.ipNftName && <p className="text-red-500 text-sm">IP-NFT name is required</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ipNftSymbol">IP-NFT Symbol</Label>
              <Input
                id="ipNftSymbol"
                placeholder="e.g., NDDS"
                {...register("ipNftSymbol", { required: true })}
                className={errors.ipNftSymbol ? "border-red-500" : ""}
              />
              {errors.ipNftSymbol && <p className="text-red-500 text-sm">IP-NFT symbol is required</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tokenURI">Token URI</Label>
              <Input
                id="tokenURI"
                placeholder="e.g., ipfs://..."
                {...register("tokenURI", { required: true })}
                className={errors.tokenURI ? "border-red-500" : ""}
              />
              {errors.tokenURI && <p className="text-red-500 text-sm">Token URI is required</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metadata">Metadata (JSON)</Label>
              <Textarea
                id="metadata"
                rows={5}
                placeholder='{"title": "My IP", "description": "Description", ...}'
                {...register("metadata", { required: true })}
                className={errors.metadata ? "border-red-500" : ""}
              />
              {errors.metadata && <p className="text-red-500 text-sm">Metadata is required</p>}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fractionalization Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="fractionName">Fraction Token Name</Label>
              <Input
                id="fractionName"
                placeholder="e.g., NDDS Fraction"
                {...register("fractionName", { required: true })}
                className={errors.fractionName ? "border-red-500" : ""}
              />
              {errors.fractionName && <p className="text-red-500 text-sm">Fraction name is required</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fractionSymbol">Fraction Token Symbol</Label>
              <Input
                id="fractionSymbol"
                placeholder="e.g., NDDSF"
                {...register("fractionSymbol", { required: true })}
                className={errors.fractionSymbol ? "border-red-500" : ""}
              />
              {errors.fractionSymbol && <p className="text-red-500 text-sm">Fraction symbol is required</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalShares">Total Shares</Label>
              <Input
                id="totalShares"
                type="number"
                placeholder="e.g., 1000"
                {...register("totalShares", { required: true, min: 1 })}
                className={errors.totalShares ? "border-red-500" : ""}
              />
              {errors.totalShares && <p className="text-red-500 text-sm">Total shares must be greater than 0</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="initialPrice">Initial Price (ETH per share)</Label>
              <Input
                id="initialPrice"
                type="number"
                step="0.001"
                placeholder="e.g., 0.01"
                {...register("initialPrice", { required: true, min: 0.000001 })}
                className={errors.initialPrice ? "border-red-500" : ""}
              />
              {errors.initialPrice && <p className="text-red-500 text-sm">Initial price must be greater than 0</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Description of the fractionalized token"
                {...register("description", { required: true })}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-red-500 text-sm">Description is required</p>}
            </div>
          </div>
        </div>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Important Information</AlertTitle>
          <AlertDescription>
            This operation will create a new IP-NFT and fractionalize it in a single transaction. 
            A fee will be calculated based on the total valuation and charged to your wallet. 
            You will receive 50% of the fractional tokens, with the other 50% held in the fractionalization contract.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={status === FractionalizationStatus.PROCESSING}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isValid || status === FractionalizationStatus.PROCESSING || status === FractionalizationStatus.SUCCESS}
          >
            {status === FractionalizationStatus.PROCESSING ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : status === FractionalizationStatus.SUCCESS ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Completed
              </>
            ) : (
              'Create & Fractionalize'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OneStepFractionalizationForm; 