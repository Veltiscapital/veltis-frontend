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
import { approveIPNFTTransfer, fractionalizeIPNFT, getFractionalizationFactoryContract } from '@/lib/blockchain';
import { BLOCKCHAIN_CONFIG } from '@/lib/config';

interface FractionalizationFormProps {
  ipnftId: string;
  ipnftContract: string;
  ipnftName: string;
  ipnftImage?: string;
  onSuccess?: (fractionAddress: string) => void;
  onCancel?: () => void;
}

enum FractionalizationStatus {
  IDLE = 'idle',
  APPROVING = 'approving',
  FRACTIONALIZING = 'fractionalizing',
  CONFIRMING = 'confirming',
  SUCCESS = 'success',
  ERROR = 'error',
}

const FractionalizationForm: React.FC<FractionalizationFormProps> = ({
  ipnftId,
  ipnftContract,
  ipnftName,
  ipnftImage,
  onSuccess,
  onCancel,
}) => {
  const { walletAddress } = useAuth();
  const [status, setStatus] = useState<FractionalizationStatus>(FractionalizationStatus.IDLE);
  const [fractionAddress, setFractionAddress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    defaultValues: {
      name: `${ipnftName} Fraction`,
      symbol: ipnftName.substring(0, 3).toUpperCase() + 'F',
      description: `Fractional ownership tokens for ${ipnftName}`,
      totalShares: '1000',
      initialPrice: '0.01',
    },
    mode: 'onChange',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      setStatus(FractionalizationStatus.APPROVING);
      
      // Get the fractionalization factory contract address
      const factoryContract = await getFractionalizationFactoryContract();
      const factoryAddress = factoryContract.address || BLOCKCHAIN_CONFIG.CONTRACTS.FRACTIONALIZATION_FACTORY;
      
      try {
        // Step 1: Approve the transfer of the IP-NFT to the fractionalization contract
        const approvalResult = await approveIPNFTTransfer(
          ipnftContract,
          factoryAddress,
          ipnftId
        );
        
        // The approveIPNFTTransfer function might return different types
        // depending on the implementation. We'll handle both possibilities.
        
        // If it's a transaction response with hash and wait method
        if (typeof approvalResult === 'object' && approvalResult !== null) {
          // Check if it has a hash property (transaction response)
          if ('hash' in approvalResult && typeof approvalResult.hash === 'string') {
            setTransactionHash(approvalResult.hash);
            
            // Check if it has a wait method (transaction response)
            if ('wait' in approvalResult && typeof approvalResult.wait === 'function') {
              await approvalResult.wait();
            } else {
              // Wait for a few seconds to ensure the transaction is processed
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
          }
          // Check if it has a transactionHash property (transaction receipt)
          else if ('transactionHash' in approvalResult && typeof approvalResult.transactionHash === 'string') {
            setTransactionHash(approvalResult.transactionHash);
          }
        }
        
        // Move to fractionalizing state
        setStatus(FractionalizationStatus.FRACTIONALIZING);
        
        // Step 2: Fractionalize the IP-NFT
        const totalShares = data.totalShares;
        const initialPrice = ethers.utils.parseEther(data.initialPrice).toString();
        
        const fractionalizationResult = await fractionalizeIPNFT(
          ipnftContract,
          ipnftId,
          data.name,
          data.symbol,
          totalShares,
          initialPrice
        );
        
        // Handle the fractionalization result
        if (typeof fractionalizationResult === 'object' && fractionalizationResult !== null) {
          // Check if it has a transactionHash property
          if ('transactionHash' in fractionalizationResult && 
              typeof fractionalizationResult.transactionHash === 'string') {
            setTransactionHash(fractionalizationResult.transactionHash);
          }
          
          // Check if it has a fractionalizationAddress property
          if ('fractionalizationAddress' in fractionalizationResult && 
              typeof fractionalizationResult.fractionalizationAddress === 'string') {
            setFractionAddress(fractionalizationResult.fractionalizationAddress);
          }
        }
        
        // Move to confirming state
        setStatus(FractionalizationStatus.CONFIRMING);
        
        // Wait for confirmations (simulated with timeout)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Complete the process
        setStatus(FractionalizationStatus.SUCCESS);
        
        // Call the onSuccess callback
        if (onSuccess && fractionAddress) {
          onSuccess(fractionAddress);
        }
      } catch (error) {
        console.error('Transaction error:', error);
        throw error;
      }
      
    } catch (error) {
      console.error('Fractionalization error:', error);
      setStatus(FractionalizationStatus.ERROR);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to fractionalize IP-NFT');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleViewFractions = () => {
    if (fractionAddress && onSuccess) {
      onSuccess(fractionAddress);
    }
  };

  const renderStatusContent = () => {
    switch (status) {
      case FractionalizationStatus.APPROVING:
        return (
          <Alert className="mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Approving Transfer</AlertTitle>
            <AlertDescription>
              Approving your IP-NFT for transfer to the fractionalization contract...
              {transactionHash && (
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
      
      case FractionalizationStatus.FRACTIONALIZING:
        return (
          <Alert className="mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Creating Fractions</AlertTitle>
            <AlertDescription>
              Creating fractional tokens for your IP-NFT...
              {transactionHash && (
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
      
      case FractionalizationStatus.CONFIRMING:
        return (
          <Alert className="mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Confirming Transaction</AlertTitle>
            <AlertDescription>
              Waiting for blockchain confirmation...
              {transactionHash && (
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
      
      case FractionalizationStatus.SUCCESS:
        return (
          <Alert className="mb-4">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle>Fractionalization Successful</AlertTitle>
            <AlertDescription>
              Your IP-NFT has been successfully fractionalized!
              <div className="mt-2">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  onClick={handleViewFractions}
                >
                  View your fractions
                </Button>
              </div>
              {transactionHash && (
                <div className="mt-1">
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
              {fractionAddress && (
                <div className="mt-1">
                  <a 
                    href={`https://amoy.polygonscan.com/address/${fractionAddress}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline text-sm"
                  >
                    View token contract on PolygonScan
                  </a>
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      
      case FractionalizationStatus.ERROR:
        return (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fractionalization Failed</AlertTitle>
            <AlertDescription>
              {errorMessage || 'An error occurred during fractionalization. Please try again.'}
            </AlertDescription>
          </Alert>
        );
      
      default:
        return errorMessage ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null;
    }
  };

  const isProcessing = [
    FractionalizationStatus.APPROVING,
    FractionalizationStatus.FRACTIONALIZING,
    FractionalizationStatus.CONFIRMING,
  ].includes(status);

  const isComplete = status === FractionalizationStatus.SUCCESS;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {renderStatusContent()}
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Token Name</Label>
          <Input
            id="name"
            {...register('name', { required: true })}
            disabled={isProcessing || isComplete}
            onChange={handleInputChange}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">Token name is required</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="symbol">Token Symbol</Label>
          <Input
            id="symbol"
            {...register('symbol', { required: true })}
            disabled={isProcessing || isComplete}
            onChange={handleInputChange}
          />
          {errors.symbol && (
            <p className="text-sm text-red-500 mt-1">Token symbol is required</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description', { required: true })}
            disabled={isProcessing || isComplete}
            onChange={handleInputChange}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">Description is required</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="totalShares">Total Shares</Label>
            <Input
              id="totalShares"
              type="number"
              {...register('totalShares', { 
                required: true,
                min: 100,
                max: 1000000
              })}
              disabled={isProcessing || isComplete}
              onChange={handleInputChange}
            />
            {errors.totalShares && (
              <p className="text-sm text-red-500 mt-1">
                Total shares must be between 100 and 1,000,000
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="initialPrice">Initial Price (MATIC)</Label>
            <Input
              id="initialPrice"
              type="number"
              step="0.001"
              {...register('initialPrice', { 
                required: true,
                min: 0.001
              })}
              disabled={isProcessing || isComplete}
              onChange={handleInputChange}
            />
            {errors.initialPrice && (
              <p className="text-sm text-red-500 mt-1">
                Initial price must be at least 0.001 MATIC
              </p>
            )}
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          disabled={isProcessing || isComplete}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isComplete ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Completed
            </>
          ) : (
            'Fractionalize IP-NFT'
          )}
        </Button>
      </div>
    </form>
  );
};

export default FractionalizationForm; 