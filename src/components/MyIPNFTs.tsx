import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { useWeb3 } from './Web3Provider';
import { IPNFTRegistryService, IPMetadata, getContracts } from '../services/contractService';
import { getImageUrlFromIPFS } from '../services/ipfsService';
import FractionalizeForm from './FractionalizeForm';
import ipfsService from '../services/ipfsService';

interface NFTItem {
  tokenId: string;
  metadata: IPMetadata;
  tokenURI: string;
  imageUrl?: string;
}

// Define the component's handle (what will be exposed via the ref)
export interface MyIPNFTsHandle {
  fetchNFTs: (forceRefresh?: boolean) => Promise<void>;
}

const MyIPNFTs = forwardRef<MyIPNFTsHandle, {}>(({}, ref) => {
  const { provider, account, isConnected, isCorrectNetwork, networkConfig, signer } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);
  const [showFractionalizeModal, setShowFractionalizeModal] = useState(false);
  const [expandedNFT, setExpandedNFT] = useState<string | null>(null);
  const [importingFromPinata, setImportingFromPinata] = useState(false);

  // Add function to check for newly minted NFTs from localStorage
  const checkForNewlyMintedNFT = async () => {
    if (!provider || !account || !isConnected || !isCorrectNetwork) {
      return null;
    }
    
    try {
      // Check if we have a recently minted token
      const lastMintedNFT = localStorage.getItem('lastMintedTokenId');
      if (!lastMintedNFT) return null;
      
      const mintData = JSON.parse(lastMintedNFT);
      
      // Check if data is still valid (within 30 minutes)
      const now = Date.now();
      const mintTime = mintData.timestamp || 0;
      const timeDiff = now - mintTime;
      
      // If more than 30 minutes old, remove it
      if (timeDiff > 30 * 60 * 1000) {
        localStorage.removeItem('lastMintedTokenId');
        return null;
      }
      
      if (!mintData.tokenId || mintData.tokenId === 'unknown') {
        return null;
      }
      
      console.log('Found recently minted NFT in localStorage:', mintData);
      
      // Directly query this NFT by ID
      const nft = await IPNFTRegistryService.getNFTById(provider, mintData.tokenId);
      
      if (nft) {
        console.log('Successfully retrieved newly minted NFT:', nft);
        return nft;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking for newly minted NFT:', error);
      return null;
    }
  };

  // Enhanced fetchNFTs with direct token lookup and multiple retries
  const fetchNFTs = async (forceRefresh = false) => {
    if (!provider || !account || !isConnected || !isCorrectNetwork) {
      console.log('Fetch NFTs: Invalid connection state');
      setNfts([]);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching NFTs for account:', account, 'Force refresh:', forceRefresh);
      
      // Clear any stale data
      localStorage.removeItem('pendingMintTransaction');
      localStorage.removeItem('lastSuccessfulIPFSUpload');
      
      const contracts = getContracts(provider);
      
      // Get the number of NFTs owned by this account with retries
      let balance;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          balance = await contracts.ipNftRegistry.balanceOf(account);
          console.log(`NFT balance (attempt ${retryCount + 1}):`, balance.toString());
          break;
        } catch (err) {
          console.error(`Error fetching balance, attempt ${retryCount + 1}:`, err);
          retryCount++;
          if (retryCount === maxRetries) throw err;
          await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
        }
      }
      
      if (!balance || balance.toNumber() === 0) {
        console.log('No NFTs found for this account');
        setNfts([]);
        setLoading(false);
        return;
      }
      
      // Process NFTs in batches to avoid timeouts
      const batchSize = 5;
      const totalNFTs = balance.toNumber();
      const results = [];
      
      for (let i = 0; i < totalNFTs; i += batchSize) {
        const batchPromises = [];
        const end = Math.min(i + batchSize, totalNFTs);
        
        for (let j = i; j < end; j++) {
          batchPromises.push(
            (async () => {
              try {
                const tokenId = await contracts.ipNftRegistry.tokenOfOwnerByIndex(account, j);
                const metadata = await IPNFTRegistryService.getIPMetadata(provider, tokenId);
                const tokenURI = await contracts.ipNftRegistry.tokenURI(tokenId);
                
                let imageUrl = null;
                if (tokenURI && tokenURI.startsWith('ipfs://')) {
                  try {
                    const cleanURI = tokenURI.replace('ipfs://', '');
                    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cleanURI}`;
                    const response = await fetch(gatewayUrl);
                    
                    if (response.ok) {
                      const ipfsMetadata = await response.json();
                      if (ipfsMetadata.image && ipfsMetadata.image.startsWith('ipfs://')) {
                        const imageHash = ipfsMetadata.image.replace('ipfs://', '');
                        imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;
                      }
                    }
                  } catch (ipfsError) {
                    console.error(`Error fetching IPFS metadata for token ${tokenId}:`, ipfsError);
                  }
                }
                
                return {
                  tokenId: tokenId.toString(),
                  metadata,
                  tokenURI,
                  imageUrl
                };
              } catch (error) {
                console.error(`Error processing token at index ${j}:`, error);
                return null;
              }
            })()
          );
        }
        
        const batchResults = await Promise.all(batchPromises);
        const validResults = batchResults.filter(result => result !== null);
        results.push(...validResults);
        
        // Update state progressively
        setNfts(current => {
          const newNfts = [...current];
          validResults.forEach(nft => {
            const index = newNfts.findIndex(existing => existing.tokenId === nft.tokenId);
            if (index >= 0) {
              newNfts[index] = nft;
            } else {
              newNfts.push(nft);
            }
          });
          return newNfts.sort((a, b) => parseInt(b.tokenId) - parseInt(a.tokenId));
        });
      }
      
      // Final state update with all results
      setNfts(results.sort((a, b) => parseInt(b.tokenId) - parseInt(a.tokenId)));
      
      if (results.length > 0) {
        toast.success(`Found ${results.length} NFTs in your collection`);
      } else {
        toast.info('No NFTs found in your collection');
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      toast.error('Failed to retrieve your NFTs. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch NFTs when connection status changes
  useEffect(() => {
    if (isConnected && isCorrectNetwork && account) {
      fetchNFTs();
    } else {
      setNfts([]);
    }
  }, [isConnected, isCorrectNetwork, account]);

  // Add polling for pending transactions
  useEffect(() => {
    // Check for pending transactions
    const checkPendingTransactions = async () => {
      if (!provider || !isConnected) return;
      
      const pendingTx = localStorage.getItem('pendingMintTransaction');
      if (!pendingTx) return;
      
      try {
        const txData = JSON.parse(pendingTx);
        if (txData.hash) {
          const receipt = await provider.getTransactionReceipt(txData.hash);
          if (receipt) {
            if (receipt.status === 1) {
              toast.success('Your pending transaction was successful!');
              localStorage.removeItem('pendingMintTransaction');
              fetchNFTs(); // Refresh NFTs after successful transaction
            } else {
              toast.error('Your pending transaction failed.');
              localStorage.removeItem('pendingMintTransaction');
            }
          }
        }
      } catch (error) {
        console.error('Error checking pending transaction:', error);
      }
    };
    
    // Set up polling
    const pendingTxInterval = setInterval(checkPendingTransactions, 10000); // Check every 10 seconds
    
    // Cleanup
    return () => clearInterval(pendingTxInterval);
  }, [provider, isConnected]);

  // Add automatic refresh of NFTs when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, refreshing NFTs');
        fetchNFTs();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Update the ref exposed function to accept the force refresh parameter
  useImperativeHandle(ref, () => ({
    fetchNFTs: (forceRefresh = false) => fetchNFTs(forceRefresh)
  }));

  // Add direct monitoring of lastMintedTokenId changes
  useEffect(() => {
    const checkLastMintedNFT = () => {
      const lastMinted = localStorage.getItem('lastMintedTokenId');
      if (lastMinted) {
        try {
          const data = JSON.parse(lastMinted);
          if (data.tokenId && data.tokenId !== 'unknown') {
            console.log('Detected newly minted NFT in storage:', data);
            fetchNFTs(true);
          }
        } catch (error) {
          console.error('Error parsing lastMintedTokenId:', error);
        }
      }
    };
    
    // Check immediately
    checkLastMintedNFT();
    
    // Also set up an interval to check periodically
    const intervalId = setInterval(checkLastMintedNFT, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Format category name
  const getCategoryName = (categoryId: number): string => {
    const categories = [
      'Patent', 'Trademark', 'Copyright', 'Trade Secret', 'Design', 'Other'
    ];
    return categories[categoryId] || 'Unknown';
  };

  // Format valuation
  const formatValuation = (value: ethers.BigNumber): string => {
    return `${ethers.utils.formatEther(value)} MATIC`;
  };

  // Format date
  const formatDate = (timestamp: ethers.BigNumber): string => {
    const date = new Date(timestamp.toNumber() * 1000);
    return date.toLocaleDateString();
  };

  // Toggle NFT details expansion
  const toggleExpand = (tokenId: string) => {
    if (expandedNFT === tokenId) {
      setExpandedNFT(null);
    } else {
      setExpandedNFT(tokenId);
    }
  };

  // Handle fractionalization
  const handleFractionalize = (tokenId: string) => {
    setSelectedNFT(tokenId);
    setShowFractionalizeModal(true);
  };

  // Close fractionalize modal
  const closeFractionalizeModal = () => {
    setShowFractionalizeModal(false);
    setSelectedNFT(null);
  };

  // Handle fractionalization success
  const handleFractionalizeSuccess = () => {
    // Refresh NFTs list
    fetchNFTs();
  };

  // View NFT on block explorer
  const viewOnExplorer = (tokenId: string) => {
    const contractAddress = import.meta.env.VITE_IP_NFT_REGISTRY_CONTRACT;
    const explorerUrl = `${networkConfig.blockExplorerUrl}/token/${contractAddress}?a=${tokenId}`;
    window.open(explorerUrl, '_blank');
  };

  // Add handler for importing from Pinata
  const handleImportFromPinata = async () => {
    if (!provider || !signer || !account || !isConnected || !isCorrectNetwork) {
      toast.error('Please connect your wallet to Polygon Amoy Testnet');
      return;
    }
    
    try {
      setImportingFromPinata(true);
      toast.info('Importing your IP NFTs from Pinata...');
      
      const importedUris = await ipfsService.importIPNFTsFromPinata(signer);
      
      if (importedUris.length > 0) {
        toast.success(`Successfully imported ${importedUris.length} IP NFTs from Pinata`);
        fetchNFTs(); // Refresh the NFTs list
      } else {
        toast.info('No new IP NFTs found to import from Pinata');
      }
    } catch (error) {
      console.error('Error importing from Pinata:', error);
      toast.error('Failed to import IP NFTs from Pinata');
    } finally {
      setImportingFromPinata(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-indigo-800">My Intellectual Property NFTs</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleImportFromPinata}
              disabled={importingFromPinata || !isConnected || !isCorrectNetwork}
              className={`px-4 py-2 rounded-md text-white text-sm transition-all ${
                importingFromPinata || !isConnected || !isCorrectNetwork
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-sm hover:shadow-md'
              }`}
            >
              {importingFromPinata ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </span>
              ) : 'Import from Pinata'}
            </button>
            <button
              onClick={() => fetchNFTs(true)}
              disabled={loading || !isConnected || !isCorrectNetwork}
              className={`px-4 py-2 rounded-md text-white text-sm transition-all ${
                loading || !isConnected || !isCorrectNetwork
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : 'Refresh'}
            </button>
          </div>
        </div>

        {!isConnected ? (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="inline-block mb-4 p-3 bg-gray-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Connect your wallet to view your IP NFTs</p>
          </div>
        ) : !isCorrectNetwork ? (
          <div className="text-center py-12 border border-dashed border-yellow-300 rounded-lg bg-yellow-50">
            <div className="inline-block mb-4 p-3 bg-yellow-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-yellow-700 mb-2 font-medium">Network Mismatch</p>
            <p className="text-yellow-600 mb-4">Please switch to {networkConfig.chainName} to view your IP NFTs</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-600">Loading your NFTs...</p>
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="inline-block mb-4 p-3 bg-gray-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">You don't have any IP NFTs yet</p>
            <p className="text-gray-500 text-sm mb-6">Mint your first intellectual property NFT to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {nfts.map((nft) => (
              <div 
                key={nft.tokenId} 
                className="border border-gray-200 hover:border-indigo-200 rounded-lg overflow-hidden transition-all hover:shadow-lg"
              >
                <div 
                  onClick={() => toggleExpand(nft.tokenId)}
                  className="cursor-pointer flex flex-col sm:flex-row sm:items-center p-6 gap-4"
                >
                  {/* NFT Image */}
                  <div className="w-full sm:w-40 h-40 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-md flex items-center justify-center border border-gray-100">
                    {nft.imageUrl ? (
                      <img 
                        src={getImageUrlFromIPFS(nft.imageUrl)} 
                        alt={nft.metadata.title}
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          console.error('Image failed to load:', nft.imageUrl);
                          // Fallback to placeholder if image fails to load
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/150?text=IP+NFT+${nft.tokenId}`;
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-3xl text-indigo-300 font-bold mb-1">IP #{nft.tokenId}</div>
                        <div className="text-xs text-gray-400">{getCategoryName(nft.metadata.category)}</div>
                      </div>
                    )}
                  </div>
                  
                  {/* NFT Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{nft.metadata.title}</h3>
                      
                      {/* Verification Badge */}
                      {nft.metadata.isVerified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Verified (Level {nft.metadata.verificationLevel})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Not Verified
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{nft.metadata.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-sm">
                      <div>
                        <span className="text-gray-500">Category:</span> {getCategoryName(nft.metadata.category)}
                      </div>
                      <div>
                        <span className="text-gray-500">Valuation:</span> {formatValuation(nft.metadata.valuation)}
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span> {formatDate(nft.metadata.createdAt)}
                      </div>
                      <div>
                        <span className="text-gray-500">Token ID:</span> {nft.tokenId}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center text-sm text-indigo-600">
                      <span>{expandedNFT === nft.tokenId ? 'Hide details' : 'Show details'}</span>
                      <svg className={`ml-1 h-4 w-4 transition-transform ${expandedNFT === nft.tokenId ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedNFT === nft.tokenId && (
                  <div className="bg-gray-50 p-6 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-800 mb-3">Detailed Information</h4>
                    
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Description</h5>
                      <p className="text-sm text-gray-600">{nft.metadata.description}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Metadata URI</h5>
                      <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded overflow-auto">{nft.tokenURI}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-6">
                      <button 
                        onClick={() => handleFractionalize(nft.tokenId)}
                        className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm"
                      >
                        Fractionalize
                      </button>
                      <button 
                        onClick={() => viewOnExplorer(nft.tokenId)}
                        className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        View on Explorer
                      </button>
                      <button 
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
                      >
                        Request Verification
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fractionalization Modal */}
      {showFractionalizeModal && selectedNFT && (
        <FractionalizeForm
          tokenId={selectedNFT}
          onClose={closeFractionalizeModal}
          onSuccess={handleFractionalizeSuccess}
        />
      )}
    </>
  );
});

export default MyIPNFTs; 