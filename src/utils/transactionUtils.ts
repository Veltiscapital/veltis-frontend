import { ethers } from 'ethers';
import { toast } from 'sonner';

/**
 * Utility functions for handling blockchain transactions
 */

/**
 * Adds MetaMask transaction event listeners
 * @param onHash Callback for when transaction hash is received
 * @param onReceipt Callback for when transaction receipt is received
 * @param onError Callback for transaction errors
 */
export const addTransactionListeners = (
  onHash?: (hash: string) => void,
  onReceipt?: (receipt: ethers.providers.TransactionReceipt) => void,
  onError?: (error: any) => void
) => {
  if (!window.ethereum) {
    console.warn('MetaMask not detected');
    return { removeListeners: () => {} };
  }
  
  const handleTxHash = (hash: string) => {
    console.log('Transaction hash received:', hash);
    if (onHash) onHash(hash);
  };
  
  const handleTxReceipt = (receipt: ethers.providers.TransactionReceipt) => {
    console.log('Transaction receipt received:', receipt);
    if (onReceipt) onReceipt(receipt);
  };
  
  const handleTxError = (error: any) => {
    console.error('Transaction error:', error);
    if (onError) onError(error);
  };
  
  // Add listeners
  window.ethereum.on('transactionHash', handleTxHash);
  window.ethereum.on('receipt', handleTxReceipt);
  window.ethereum.on('error', handleTxError);
  
  // Return function to remove listeners
  return {
    removeListeners: () => {
      window.ethereum?.removeListener('transactionHash', handleTxHash);
      window.ethereum?.removeListener('receipt', handleTxReceipt);
      window.ethereum?.removeListener('error', handleTxError);
    }
  };
};

/**
 * Waits for a transaction to be confirmed with retries
 * @param provider Ethereum provider
 * @param txHash Transaction hash
 * @param confirmations Number of confirmations to wait for
 * @param timeout Timeout in milliseconds
 * @returns Transaction receipt or null if timeout
 */
export const waitForTransaction = async (
  provider: ethers.providers.Provider,
  txHash: string,
  confirmations = 1,
  timeout = 60000
): Promise<ethers.providers.TransactionReceipt | null> => {
  // Start time for timeout calculation
  const startTime = Date.now();
  
  // Function to check receipt with retries
  const checkReceipt = async (): Promise<ethers.providers.TransactionReceipt | null> => {
    try {
      // Check if transaction is confirmed
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (receipt && receipt.confirmations >= confirmations) {
        return receipt;
      }
      
      // Check timeout
      if (Date.now() - startTime > timeout) {
        console.warn(`Transaction ${txHash} timed out after ${timeout}ms`);
        return null;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Recursive retry
      return checkReceipt();
    } catch (error) {
      console.error('Error checking transaction receipt:', error);
      
      // Check timeout
      if (Date.now() - startTime > timeout) {
        console.warn(`Transaction ${txHash} timed out after ${timeout}ms`);
        return null;
      }
      
      // Wait longer before retry after error
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Recursive retry
      return checkReceipt();
    }
  };
  
  return checkReceipt();
};

/**
 * Handle a pending transaction with UI feedback
 * @param txHash Transaction hash
 * @param provider Ethereum provider
 * @param options Additional options
 */
export const handlePendingTransaction = async (
  txHash: string,
  provider: ethers.providers.Provider,
  options: {
    onSuccess?: () => void;
    onFailure?: () => void;
    successMessage?: string;
    failureMessage?: string;
    storageKey?: string;
  } = {}
) => {
  const {
    onSuccess,
    onFailure,
    successMessage = 'Transaction successful!',
    failureMessage = 'Transaction failed',
    storageKey = 'pendingMintTransaction'
  } = options;
  
  try {
    toast.info(`Transaction submitted: ${txHash.substring(0, 10)}...`, {
      duration: 5000,
    });
    
    // Store the transaction in localStorage
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify({
        hash: txHash,
        timestamp: Date.now()
      }));
    }
    
    // Wait for confirmation with extended timeout
    const receipt = await waitForTransaction(provider, txHash, 1, 120000);
    
    if (receipt) {
      if (receipt.status === 1) {
        // Transaction successful
        toast.success(successMessage);
        if (storageKey) localStorage.removeItem(storageKey);
        if (onSuccess) onSuccess();
      } else {
        // Transaction failed
        toast.error(failureMessage);
        if (storageKey) localStorage.removeItem(storageKey);
        if (onFailure) onFailure();
      }
    } else {
      // Timed out, but could still succeed
      toast.warning('Transaction taking longer than expected. Check back later.');
    }
  } catch (error) {
    console.error('Error handling transaction:', error);
    toast.error('Error monitoring transaction');
    if (onFailure) onFailure();
  }
};

/**
 * Check if there are any pending transactions in localStorage
 * @param provider Ethereum provider
 * @param storageKey localStorage key for pending transaction
 * @returns True if any pending transactions were found and checked
 */
export const checkPendingTransactions = async (
  provider: ethers.providers.Provider,
  storageKey = 'pendingMintTransaction'
): Promise<boolean> => {
  try {
    const pendingTx = localStorage.getItem(storageKey);
    if (!pendingTx) return false;
    
    const txData = JSON.parse(pendingTx);
    if (!txData.hash) return false;
    
    toast.info('Checking status of your previous transaction...');
    
    const receipt = await provider.getTransactionReceipt(txData.hash);
    if (receipt) {
      if (receipt.status === 1) {
        toast.success('Your previous transaction was successful!');
      } else {
        toast.error('Your previous transaction failed');
      }
      localStorage.removeItem(storageKey);
      return true;
    } else {
      const pendingTimeMs = Date.now() - (txData.timestamp || 0);
      // If more than 1 hour has passed, consider it lost
      if (pendingTimeMs > 3600000) {
        toast.warning('Your previous transaction has been pending for too long and may be lost');
        localStorage.removeItem(storageKey);
      } else {
        toast.info('Your previous transaction is still pending');
      }
      return true;
    }
  } catch (error) {
    console.error('Error checking pending transactions:', error);
    return false;
  }
}; 