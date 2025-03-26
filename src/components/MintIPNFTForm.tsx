import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { useWeb3 } from './Web3Provider';
import { IPNFTRegistryService, getContracts } from '../services/contractService';
import { uploadToIPFS } from '../services/ipfsService';

// Transaction states
type TransactionState = 
  | 'idle'
  | 'uploading-to-ipfs'
  | 'ipfs-complete'
  | 'awaiting-wallet'
  | 'transaction-submitted'
  | 'transaction-confirming'
  | 'transaction-complete'
  | 'error';

// IP categories
const IP_CATEGORIES = [
  { id: 0, name: 'Patent' },
  { id: 1, name: 'Trademark' },
  { id: 2, name: 'Copyright' },
  { id: 3, name: 'Trade Secret' },
  { id: 4, name: 'Design' },
  { id: 5, name: 'Other' }
];

// Development stages for IP assets
const DEVELOPMENT_STAGES = [
  { id: 0, name: 'Concept' },
  { id: 1, name: 'Research' },
  { id: 2, name: 'Development' },
  { id: 3, name: 'Testing' },
  { id: 4, name: 'Production' },
  { id: 5, name: 'Commercialized' }
];

interface MintIPNFTFormProps {
  onSuccess?: (tokenId: string) => void;
}

const MintIPNFTForm: React.FC<MintIPNFTFormProps> = ({ onSuccess }) => {
  const { signer, isConnected, isCorrectNetwork } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [txState, setTxState] = useState<TransactionState>('idle');
  const [mintTimeout, setMintTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [currentTokenId, setCurrentTokenId] = useState<string | null>(null);
  const [lastIPFSUri, setLastIPFSUri] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<number>(0);
  const [developmentStage, setDevelopmentStage] = useState<number>(0);
  const [institution, setInstitution] = useState('');
  const [registrationDetails, setRegistrationDetails] = useState('');
  const [valuation, setValuation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Handle image file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Check for pending transactions on mount
  useEffect(() => {
    const checkPendingTransactions = async () => {
      // Check localStorage for pending transactions
      const pendingTx = localStorage.getItem('pendingMintTransaction');
      const pendingIpfs = localStorage.getItem('lastSuccessfulIPFSUpload');
      
      if (pendingTx) {
        try {
          const txData = JSON.parse(pendingTx);
          if (txData.hash && signer?.provider) {
            setLastTxHash(txData.hash);
            setTxState('transaction-confirming');
            toast.info('Resuming a pending transaction. Please wait...');
            
            try {
              // Check transaction status
              const receipt = await signer.provider.getTransactionReceipt(txData.hash);
              
              if (receipt) {
                if (receipt.status === 1) {
                  // Transaction successful
                  toast.success('Your previous NFT mint was successful!');
                  localStorage.removeItem('pendingMintTransaction');
                  setTxState('idle');
                  
                  // If token ID was stored, use it
                  if (txData.tokenId) {
                    handleMintSuccess(txData.tokenId);
                  } else {
                    // Attempt to get the latest token ID
                    const tokenId = await IPNFTRegistryService.getLatestTokenId(signer);
                    if (tokenId) {
                      handleMintSuccess(tokenId.toString());
                    }
                  }
                } else {
                  // Transaction failed
                  toast.error('Your previous transaction failed.');
                  localStorage.removeItem('pendingMintTransaction');
                  setTxState('idle');
                }
              } else {
                // Transaction still pending
                toast.info('You have a pending transaction. Monitoring for confirmation...');
                monitorTransaction(txData.hash);
              }
            } catch (error) {
              console.error('Error checking transaction status:', error);
              toast.error('Could not check transaction status.');
              setTxState('idle');
            }
          }
        } catch (error) {
          console.error('Error parsing pending transaction:', error);
          localStorage.removeItem('pendingMintTransaction');
        }
      } else if (pendingIpfs && !pendingTx) {
        // We have an IPFS upload but no transaction
        setLastIPFSUri(pendingIpfs);
        toast.info('Found a previous IPFS upload. You can continue minting.');
      }
    };
    
    if (signer && isConnected && isCorrectNetwork) {
      checkPendingTransactions();
    }
  }, [signer, isConnected, isCorrectNetwork]);

  // Add timeout for IPFS upload
  useEffect(() => {
    let ipfsTimeout: NodeJS.Timeout | null = null;
    
    if (txState === 'uploading-to-ipfs') {
      ipfsTimeout = setTimeout(() => {
        toast.error('IPFS upload is taking longer than expected. You can try again or import from Pinata later.');
        setTxState('error');
        setLoading(false);
      }, 30000); // 30 seconds timeout for IPFS upload
    }
    
    // Cleanup function
    return () => {
      if (ipfsTimeout) {
        clearTimeout(ipfsTimeout);
      }
    };
  }, [txState]);

  // Add timeout for transaction confirmation
  useEffect(() => {
    let transactionTimeout: NodeJS.Timeout | null = null;
    
    if (txState === 'awaiting-wallet' || txState === 'transaction-submitted') {
      transactionTimeout = setTimeout(() => {
        // If we're waiting for the wallet but it's taking too long
        const timeoutMessage = txState === 'awaiting-wallet'
          ? 'MetaMask popup may be blocked. Please check your wallet.'
          : 'Transaction is taking longer than expected. It may still complete in the background.';
          
        toast.error(timeoutMessage);
        toast.info('You can refresh your NFTs later or import from Pinata');
        setTxState('error');
        setLoading(false);
      }, 60000); // 1 minute timeout
      
      setMintTimeout(transactionTimeout);
    }
    
    // Cleanup function
    return () => {
      if (transactionTimeout) {
        clearTimeout(transactionTimeout);
        setMintTimeout(null);
      }
    };
  }, [txState]);

  // Function to monitor transaction status with improved token ID extraction
  const monitorTransaction = async (txHash: string) => {
    if (!signer?.provider) return;
    
    try {
      // Start polling for transaction confirmation
      console.log('Waiting for transaction confirmation:', txHash);
      setTxState('transaction-confirming');
      
      // Add a timeout to avoid infinite waiting
      const receiptPromise = signer.provider.waitForTransaction(txHash, 1);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Transaction confirmation timeout')), 120000)
      );
      
      // Race between receipt and timeout
      const receipt = await Promise.race([receiptPromise, timeoutPromise]);
      console.log('Transaction receipt received:', receipt);
      
      if (receipt && receipt.status === 1) {
        // Transaction successful - try to get the token ID directly from the logs
        let tokenId: string | null = null;
        
        // Look for the TokenMinted event in the logs
        if (receipt.logs && receipt.logs.length > 0) {
          for (const log of receipt.logs) {
            try {
              // Get the contract ABI to decode logs
              const contracts = getContracts(signer.provider);
              const ipNftRegistry = contracts.ipNftRegistry;
              
              // Attempt to parse the log as a TokenMinted event
              const parsedLog = ipNftRegistry.interface.parseLog(log);
              
              // Check if this is the TokenMinted event
              if (parsedLog && parsedLog.name === 'TokenMinted') {
                tokenId = parsedLog.args.tokenId.toString();
                console.log('Found token ID from event logs:', tokenId);
                break;
              }
            } catch (logError) {
              // Ignore parsing errors, just try the next log
              continue;
            }
          }
        }
        
        if (!tokenId) {
          // Fallback to getting latest token ID
          console.log('Could not extract token ID from logs, trying getLatestTokenId...');
          const latestTokenId = await IPNFTRegistryService.getLatestTokenId(signer);
          if (latestTokenId) {
            tokenId = latestTokenId.toString();
            console.log('Latest token ID retrieved:', tokenId);
          }
        }
        
        // Save the token ID to localStorage for persistence across page reloads
        if (tokenId) {
          localStorage.setItem('lastMintedTokenId', JSON.stringify({
            tokenId,
            timestamp: Date.now(),
            transactionHash: txHash
          }));
        }
        
        // Show success message
        toast.success(tokenId 
          ? `IP NFT #${tokenId} Minted Successfully!` 
          : 'IP NFT Minted Successfully!');
        
        // Clear pending transaction from localStorage
        localStorage.removeItem('pendingMintTransaction');
        localStorage.removeItem('lastSuccessfulIPFSUpload');
        
        // Update state
        setTxState('transaction-complete');
        setLoading(false);
        
        // Reset form
        resetForm();
        
        // If we have a token ID, set it and trigger success callback
        if (tokenId) {
          setCurrentTokenId(tokenId);
          handleMintSuccess(tokenId);
        }
      } else {
        // Transaction failed
        toast.error('Transaction failed');
        setTxState('error');
        setLoading(false);
        
        // Clear pending transaction
        localStorage.removeItem('pendingMintTransaction');
      }
    } catch (error) {
      console.error('Error monitoring transaction:', error);
      toast.error('Failed to monitor transaction');
      setTxState('error');
      setLoading(false);
    }
  };

  // Reset form values
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(0);
    setDevelopmentStage(0);
    setInstitution('');
    setRegistrationDetails('');
    setValuation('');
    setImageFile(null);
    setPreviewUrl('');
  };

  // Handle mint success
  const handleMintSuccess = (tokenId: string) => {
    if (onSuccess) {
      onSuccess(tokenId);
    }
  };

  // Function to continue minting with already uploaded IPFS URI
  const handleContinueMinting = async () => {
    if (!lastIPFSUri || !signer || !isConnected || !isCorrectNetwork) return;
    
    try {
      setLoading(true);
      setTxState('awaiting-wallet');
      
      // Parse the metadata to get the title, description, etc.
      try {
        // Get the CID from the URI
        const cid = lastIPFSUri.replace('ipfs://', '');
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
        
        if (response.ok) {
          const metadata = await response.json();
          
          // Pre-fill the form with the metadata
          if (metadata.name) setTitle(metadata.name);
          if (metadata.description) setDescription(metadata.description);
          
          // Handle properties
          if (metadata.properties) {
            // Category
            if (metadata.properties.category) {
              const categoryIndex = IP_CATEGORIES.findIndex(
                cat => cat.name.toLowerCase() === metadata.properties.category.toLowerCase()
              );
              if (categoryIndex >= 0) setCategory(categoryIndex);
            }
            
            // Development stage
            if (metadata.properties.developmentStage) {
              const stageIndex = DEVELOPMENT_STAGES.findIndex(
                stage => stage.name.toLowerCase() === metadata.properties.developmentStage.toLowerCase()
              );
              if (stageIndex >= 0) setDevelopmentStage(stageIndex);
            }
            
            // Institution
            if (metadata.properties.institution) {
              setInstitution(metadata.properties.institution);
            }
            
            // Registration details
            if (metadata.properties.registrationDetails) {
              setRegistrationDetails(metadata.properties.registrationDetails);
            }
            
            // Valuation
            if (metadata.properties.valuation) {
              const match = metadata.properties.valuation.match(/(\d+(\.\d+)?)/);
              if (match) setValuation(match[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing metadata:', error);
      }
      
      // Prepare transaction
      const valuationBN = ethers.utils.parseEther(valuation || '1');
      
      const mintTxPromise = IPNFTRegistryService.mintIPNFT(
        signer,
        title || 'Untitled IP',
        description || 'No description',
        category,
        valuationBN,
        lastIPFSUri
      );
      
      // Set up event listeners for MetaMask events
      if (window.ethereum) {
        // Use the standard 'on' method instead of 'once'
        const handleTxHash = (hash: string) => {
          console.log('Transaction hash received:', hash);
          setLastTxHash(hash);
          setTxState('transaction-submitted');
          
          // Store pending transaction in localStorage
          localStorage.setItem('pendingMintTransaction', JSON.stringify({
            hash,
            ipfsUri: lastIPFSUri,
            timestamp: Date.now()
          }));
          
          toast.info('Transaction submitted to the blockchain');
          
          // Remove the listener after it fires once
          window.ethereum?.removeListener('transactionHash', handleTxHash);
        };
        
        window.ethereum.on('transactionHash', handleTxHash);
      }
      
      // Execute transaction
      const mintTx = await mintTxPromise;
      console.log('Mint transaction result:', mintTx);
      
      // Define how to handle different return types
      if (typeof mintTx === 'object') {
        // Handle as transaction response
        if ('hash' in mintTx && mintTx.hash) {
          setLastTxHash(mintTx.hash as string);
          setTxState('transaction-confirming');
          
          // Wait for confirmation
          monitorTransaction(mintTx.hash as string);
        } else if (ethers.BigNumber.isBigNumber(mintTx)) {
          // It's a BigNumber (likely token ID)
          setCurrentTokenId(mintTx.toString());
          setTxState('transaction-complete');
          handleMintSuccess(mintTx.toString());
          localStorage.removeItem('lastSuccessfulIPFSUpload');
          setLoading(false);
        }
      } else if (typeof mintTx === 'string') {
        // It might be a transaction hash
        setLastTxHash(mintTx);
        setTxState('transaction-confirming');
        monitorTransaction(mintTx);
      }
    } catch (error) {
      console.error('Error continuing mint process:', error);
      toast.error('Failed to mint NFT with existing IPFS data.');
      setTxState('error');
      setLoading(false);
    }
  };

  // Main submit handler for the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signer || !isConnected || !isCorrectNetwork) {
      toast.error('Please connect your wallet to Polygon Amoy Testnet');
      return;
    }
    
    if (!title || !description || !imageFile) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setTxState('uploading-to-ipfs');
      
      // Create metadata and upload to IPFS
      const metadata = {
        name: title,
        description,
        properties: {
          category: IP_CATEGORIES[category].name,
          developmentStage: DEVELOPMENT_STAGES[developmentStage].name,
          institution,
          registrationDetails,
          valuation: `${valuation} MATIC`
        }
      };
      
      // Upload to IPFS with retries
      let ipfsUri = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          ipfsUri = await uploadToIPFS(metadata, imageFile);
          console.log('IPFS upload successful:', ipfsUri);
          break;
        } catch (error) {
          console.error(`IPFS upload failed (attempt ${retryCount + 1}):`, error);
          retryCount++;
          if (retryCount === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
        }
      }
      
      if (!ipfsUri) {
        throw new Error('Failed to upload to IPFS after multiple attempts');
      }
      
      // Store the IPFS URI in localStorage temporarily
      localStorage.setItem('lastSuccessfulIPFSUpload', ipfsUri);
      
      // Update state
      setLastIPFSUri(ipfsUri);
      setTxState('ipfs-complete');
      
      // Now prepare the transaction
      setTxState('awaiting-wallet');
      
      // Parse the valuation from ETH to Wei
      const valuationBN = ethers.utils.parseEther(valuation || '1');
      
      // Create the transaction with retries
      let transaction = null;
      retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          transaction = await IPNFTRegistryService.mintIPNFT(
            signer,
            title,
            description,
            category,
            valuationBN,
            ipfsUri
          );
          break;
        } catch (error) {
          console.error(`Transaction creation failed (attempt ${retryCount + 1}):`, error);
          retryCount++;
          if (retryCount === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
        }
      }
      
      if (!transaction) {
        throw new Error('Failed to create transaction after multiple attempts');
      }
      
      // Set up transaction monitoring
      let transactionHash = null;
      
      // Listen for transaction hash event
      if (window.ethereum) {
        const handleTxHash = (hash: string) => {
          console.log('Transaction hash received from event:', hash);
          transactionHash = hash;
          setLastTxHash(hash);
          setTxState('transaction-submitted');
          
          // Store pending transaction data
          localStorage.setItem('pendingMintTransaction', JSON.stringify({
            hash,
            ipfsUri,
            timestamp: Date.now()
          }));
          
          toast.info('Transaction submitted to the blockchain');
          
          // Start monitoring for confirmation
          monitorTransaction(hash);
          
          // Remove the listener
          window.ethereum?.removeListener('transactionHash', handleTxHash);
        };
        
        window.ethereum.on('transactionHash', handleTxHash);
      }
      
      // Execute the transaction with timeout
      const txPromise = transaction.wait ? transaction.wait() : transaction;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction timeout')), 60000)
      );
      
      try {
        const receipt = await Promise.race([txPromise, timeoutPromise]);
        
        if (receipt && receipt.status === 1) {
          // Transaction successful
          console.log('Transaction successful:', receipt);
          
          // Try to get token ID from receipt
          const tokenId = await IPNFTRegistryService.getTokenIdFromTransactionReceipt(receipt);
          
          if (tokenId) {
            console.log('Token ID from receipt:', tokenId);
            setCurrentTokenId(tokenId.toString());
            handleMintSuccess(tokenId.toString());
            
            // Clear localStorage
            localStorage.removeItem('pendingMintTransaction');
            localStorage.removeItem('lastSuccessfulIPFSUpload');
            
            // Reset form
            resetForm();
            setTxState('transaction-complete');
          }
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error) {
        if (error.message === 'Transaction timeout') {
          toast.error('Transaction is taking longer than expected. Check your wallet for status.');
        } else {
          console.error('Transaction error:', error);
          toast.error('Transaction failed: ' + error.message);
        }
        setTxState('error');
      }
    } catch (error) {
      console.error('Minting error:', error);
      
      if (error.code === 4001) {
        toast.error('Transaction was rejected in your wallet');
      } else if (txState === 'uploading-to-ipfs') {
        toast.error('Failed to upload to IPFS: ' + error.message);
      } else {
        toast.error('Minting failed: ' + error.message);
      }
      
      setTxState('error');
    } finally {
      setLoading(false);
    }
  };

  // Render pending transaction UI
  const renderPendingTransaction = () => {
    if (!lastTxHash || (txState !== 'transaction-submitted' && txState !== 'transaction-confirming')) {
      return null;
    }

    const explorerUrl = `${import.meta.env.VITE_BLOCK_EXPLORER_URL}/tx/${lastTxHash}`;
    
    return (
      <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
        <h3 className="text-lg font-medium text-indigo-800 mb-2">Transaction in Progress</h3>
        
        <div className="flex items-center mb-3">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-medium text-indigo-700">
            {txState === 'transaction-submitted' ? 'Transaction submitted...' : 'Waiting for confirmation...'}
          </span>
        </div>
        
        <p className="text-sm text-indigo-600 mb-3">
          Your transaction is currently being processed on the blockchain. This might take a few moments.
        </p>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="text-xs text-indigo-500 font-mono truncate flex-grow">
            {lastTxHash.slice(0, 14)}...{lastTxHash.slice(-14)}
          </div>
          <a 
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
          >
            View on Block Explorer
            <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
        
        <div className="mt-3 pt-3 border-t border-indigo-100">
          <button
            onClick={() => {
              // Switch to the My NFTs tab to see your collection
              localStorage.setItem('veltis-redirect', 'my-nfts');
              window.location.reload();
            }}
            className="text-sm text-indigo-700 hover:text-indigo-900 flex items-center"
          >
            View my NFT collection
            <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-indigo-800">Mint Intellectual Property NFT</h2>
      
      {/* Show pending transaction state */}
      {txState === 'transaction-confirming' && lastTxHash && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-md font-medium text-yellow-800 mb-2">Transaction In Progress</h3>
          <p className="text-sm text-yellow-600 mb-2">Your transaction is being processed on the blockchain.</p>
          <div className="flex items-center space-x-2">
            <div className="animate-pulse bg-yellow-200 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-mono break-all text-yellow-700">
              {lastTxHash}
            </span>
          </div>
          <a 
            href={`${import.meta.env.VITE_BLOCK_EXPLORER_URL}/tx/${lastTxHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center"
          >
            View on Block Explorer
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
      
      {/* Show IPFS continuation option */}
      {lastIPFSUri && txState !== 'transaction-confirming' && txState !== 'transaction-submitted' && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
          <h3 className="text-md font-medium text-indigo-800 mb-2">Previously Uploaded IP Found</h3>
          <p className="text-sm text-indigo-600 mb-2">
            You have an IP asset already uploaded to IPFS that hasn't been minted yet.
          </p>
          <div className="text-sm font-mono break-all text-indigo-700 mb-2">
            {lastIPFSUri}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleContinueMinting}
              disabled={loading}
              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
            >
              Continue Minting
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('lastSuccessfulIPFSUpload');
                setLastIPFSUri(null);
                toast.info('Previous IPFS data cleared');
              }}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
            >
              Discard & Start Fresh
            </button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter the IP title"
                required
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe your intellectual property"
                rows={4}
                required
              />
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {IP_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Development Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Development Stage <span className="text-red-500">*</span>
              </label>
              <select
                value={developmentStage}
                onChange={(e) => setDevelopmentStage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {DEVELOPMENT_STAGES.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Institution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution or Owner
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Research institution or owner"
              />
            </div>
            
            {/* Registration Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration/Patent Details
              </label>
              <input
                type="text"
                value={registrationDetails}
                onChange={(e) => setRegistrationDetails(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Patent number, registration details, etc."
              />
            </div>
            
            {/* Valuation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valuation (MATIC) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valuation}
                onChange={(e) => setValuation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter valuation in MATIC"
                required
              />
            </div>
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                  required={!lastIPFSUri} // Not required if we're using existing IPFS data
                />
              </div>
              {previewUrl && (
                <div className="mt-2">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="h-32 w-32 object-cover rounded-md border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Submit Button with status indicator */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading || !isConnected || !isCorrectNetwork || txState === 'transaction-confirming'}
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition-all ${
              loading || !isConnected || !isCorrectNetwork || txState === 'transaction-confirming'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                {txState === 'uploading-to-ipfs' && 'Uploading to IPFS...'}
                {txState === 'ipfs-complete' && 'Preparing Transaction...'}
                {txState === 'awaiting-wallet' && 'Awaiting Wallet Confirmation...'}
                {txState === 'transaction-submitted' && 'Transaction Submitted...'}
                {txState === 'transaction-confirming' && 'Confirming Transaction...'}
                <svg className="animate-spin ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            ) : 'Mint IP NFT'}
          </button>
          
          {/* Transaction or wallet status information */}
          {txState === 'awaiting-wallet' && (
            <div className="mt-2 p-2 bg-blue-50 text-blue-700 text-sm rounded-md text-center">
              Please confirm the transaction in your MetaMask wallet
              <br />
              <span className="text-xs">
                If you don't see the MetaMask popup, click the MetaMask icon in your browser extensions
              </span>
            </div>
          )}
          
          {txState === 'error' && (
            <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded-md text-center">
              There was an error with your transaction. You can try again or check the "My NFTs" tab to see if it completed anyway.
            </div>
          )}
        </div>
        
        {!isConnected && (
          <p className="text-red-500 text-sm mt-2">
            Please connect your wallet to mint an IP NFT.
          </p>
        )}
        
        {isConnected && !isCorrectNetwork && (
          <p className="text-red-500 text-sm mt-2">
            Please switch to the Polygon Amoy Testnet to mint an IP NFT.
          </p>
        )}
      </form>
      
      {renderPendingTransaction()}
    </div>
  );
};

export default MintIPNFTForm; 