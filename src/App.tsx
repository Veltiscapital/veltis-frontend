import React, { useState, useEffect } from 'react';
import { useWeb3 } from './components/Web3Provider';
import { toast } from 'sonner';
import MintIPNFTForm from './components/MintIPNFTForm';
import MyIPNFTs from './components/MyIPNFTs';
import { uploadToIPFS } from './services/ipfsService';
import NFTStorageTest from './components/NFTStorageTest';
import PinataTest from './components/PinataTest';

// Define the Tab type for clarity
type TabType = 'dashboard' | 'mint' | 'my-nfts';

const App: React.FC = () => {
  const { account, isConnected, connectWallet, disconnectWallet, isCorrectNetwork, switchNetwork, chainId, networkConfig } = useWeb3();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Create a reference to the MyIPNFTs component
  const myNFTsRef = React.useRef<any>(null);

  // Add this code after your useState declarations
  // Check for redirects from other pages (e.g., after minting)
  useEffect(() => {
    const redirectTab = localStorage.getItem('veltis-redirect');
    if (redirectTab) {
      if (redirectTab === 'my-nfts') {
        setActiveTab('my-nfts');
        
        // Slight delay to ensure components are mounted
        setTimeout(() => {
          if (myNFTsRef.current) {
            myNFTsRef.current.fetchNFTs(true);
          }
        }, 500);
      }
      // Clear the redirect after processing
      localStorage.removeItem('veltis-redirect');
    }
  }, []);

  // Add a component to display transaction success message
  const TransactionSuccessMessage = ({ tokenId, onClose }: { tokenId: string, onClose: () => void }) => {
    if (!tokenId) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-center text-gray-900 mb-2">NFT Minted Successfully!</h3>
          <p className="text-center text-gray-600 mb-6">
            Your IP NFT #{tokenId} has been successfully minted and added to your collection.
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              View My Collection
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add state for success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchNetwork();
    } catch (error) {
      console.error('Network switch error:', error);
      toast.error('Failed to switch network');
    }
  };

  // Update tab change handler with correct type
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    
    // If switching to My NFTs tab, refresh the NFT collection
    if (tab === 'my-nfts' && myNFTsRef.current) {
      setTimeout(() => {
        myNFTsRef.current?.fetchNFTs();
      }, 500); // Small delay to ensure UI updates first
    }
  };

  // Modify the handleMintSuccess function
  const handleMintSuccess = (tokenId: string) => {
    console.log(`Mint successful, token ID: ${tokenId}`);
    
    // Ensure we have the token ID in localStorage for direct retrieval
    if (tokenId && tokenId !== 'unknown') {
      localStorage.setItem('lastMintedTokenId', JSON.stringify({
        tokenId,
        timestamp: Date.now()
      }));
      
      // Set state for success modal
      setMintedTokenId(tokenId);
      setShowSuccessModal(true);
    }
    
    // Immediately show a success message with token ID
    toast.success(
      tokenId && tokenId !== 'unknown'
        ? `NFT #${tokenId} minted successfully!`
        : 'NFT minted successfully!',
      { duration: 5000 }
    );
    
    // Set a redirect flag that will be checked when components mount/remount
    localStorage.setItem('veltis-redirect', 'my-nfts');
    
    // First switch to the My NFTs tab to initiate UI changes
    setActiveTab('my-nfts');
    
    // Use a more robust approach to refresh NFTs
    const attemptRefresh = (attempt = 1, maxAttempts = 3) => {
      // Only try to refresh if we have a reference
      if (myNFTsRef.current) {
        console.log(`Refreshing NFTs after minting (attempt ${attempt})...`);
        
        // Try to refresh
        myNFTsRef.current.fetchNFTs(true);
        
        // Check if we need another attempt
        if (attempt < maxAttempts) {
          setTimeout(() => {
            // Check if we still need to refresh by looking for lastMintedTokenId
            const lastMinted = localStorage.getItem('lastMintedTokenId');
            if (lastMinted) {
              attemptRefresh(attempt + 1, maxAttempts);
            }
          }, 3000); // 3 second delay between attempts
        }
      }
    };
    
    // Start the refresh attempts with a short delay
    setTimeout(() => {
      attemptRefresh();
    }, 1000);
  };

  // Add close handler for success modal
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setMintedTokenId(null);
  };

  const testNFTStorage = async () => {
    try {
      console.log('Testing NFT.Storage API...');
      console.log('API Key:', import.meta.env.VITE_NFT_STORAGE_API_KEY);
      
      // Create a simple test file
      const testFile = new File(
        [new Uint8Array([0, 1, 2, 3, 4])], 
        'test.bin', 
        { type: 'application/octet-stream' }
      );
      
      // Warning: uploadToNFTStorage is now deprecated, using uploadToIPFS instead
      const result = await uploadToIPFS(
        {
          name: 'Test NFT',
          description: 'This is a test NFT to check if NFT.Storage is working',
          properties: {
            test: true,
            timestamp: Date.now()
          }
        },
        testFile
      );
      
      console.log('Upload successful:', result);
      alert('NFT.Storage test successful! Result: ' + result);
    } catch (error) {
      console.error('NFT.Storage test failed:', error);
      alert('NFT.Storage test failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const testIPFS = async () => {
    try {
      console.log('Testing Pinata IPFS API...');
      console.log('Using Pinata credentials...');
      
      // Create a simple test file
      const testFile = new File(
        [new Uint8Array([0, 1, 2, 3, 4])], 
        'test.bin', 
        { type: 'application/octet-stream' }
      );
      
      // Try uploading
      const result = await uploadToIPFS(
        {
          name: 'Test Pinata NFT',
          description: 'This is a test NFT using Pinata IPFS',
          properties: {
            test: true,
            timestamp: Date.now()
          }
        },
        testFile
      );
      
      console.log('Pinata upload successful:', result);
      alert('Pinata IPFS test successful! Result: ' + result);
    } catch (error) {
      console.error('Pinata IPFS test failed:', error);
      alert('Pinata IPFS test failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo and Name */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Veltis</h1>
                <p className="text-xs text-gray-500">Fractional IP NFT Marketplace</p>
              </div>
            </div>
            
            {/* Connection Button */}
            <div>
              {isConnected ? (
                <div className="flex items-center gap-3">
                  <div className="hidden md:block">
                    <div className="flex items-center px-3 py-1 border border-gray-200 rounded-md bg-gray-50">
                      <span className="text-xs text-gray-500 mr-2">
                        {networkConfig.chainName}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg px-3 py-1.5 text-sm font-medium">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </div>
                  
                  {!isCorrectNetwork && (
                    <button
                      onClick={handleSwitchNetwork}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 shadow-sm transition-colors"
                    >
                      Switch Network
                    </button>
                  )}
                  
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 shadow-sm transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md shadow-sm transition-all hover:shadow"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              className={`inline-flex items-center px-1 pt-1 pb-2 border-b-2 text-sm font-medium ${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('dashboard')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1.5 ${activeTab === 'dashboard' ? 'text-indigo-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </button>
            <button
              className={`inline-flex items-center px-1 pt-1 pb-2 border-b-2 text-sm font-medium ${
                activeTab === 'mint'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('mint')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1.5 ${activeTab === 'mint' ? 'text-indigo-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Mint IP NFT
            </button>
            <button
              className={`inline-flex items-center px-1 pt-1 pb-2 border-b-2 text-sm font-medium ${
                activeTab === 'my-nfts'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('my-nfts')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1.5 ${activeTab === 'my-nfts' ? 'text-indigo-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              My IP NFTs
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 sm:p-10">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold text-white mb-2">Welcome to Veltis</h2>
                  <p className="text-indigo-100 text-lg mb-6">Your gateway to fractional IP NFT ownership and management</p>
                  
                  {!isConnected ? (
                    <button 
                      onClick={handleConnect}
                      className="px-6 py-3 bg-white text-indigo-600 rounded-lg shadow-md hover:bg-indigo-50 font-medium transition-colors"
                    >
                      Connect Your Wallet
                    </button>
                  ) : !isCorrectNetwork ? (
                    <button
                      onClick={handleSwitchNetwork}
                      className="px-6 py-3 bg-white text-indigo-600 rounded-lg shadow-md hover:bg-indigo-50 font-medium transition-colors"
                    >
                      Switch to {networkConfig.chainName}
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={() => handleTabChange('mint')}
                        className="px-6 py-3 bg-white text-indigo-600 rounded-lg shadow-md hover:bg-indigo-50 font-medium transition-colors"
                      >
                        Mint New IP NFT
                      </button>
                      <button 
                        onClick={() => handleTabChange('my-nfts')}
                        className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg shadow-md hover:bg-white/30 font-medium transition-colors"
                      >
                        View My Collection
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Features */}
              <div className="bg-white p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-indigo-100 p-3 rounded-full mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Secure IP Protection</h3>
                    <p className="text-gray-500 text-sm">Tokenize your intellectual property with blockchain security and verification</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-purple-100 p-3 rounded-full mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Fractional Ownership</h3>
                    <p className="text-gray-500 text-sm">Divide your IP assets into tradable fractions to raise capital or share ownership</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="bg-pink-100 p-3 rounded-full mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Marketplace Trading</h3>
                    <p className="text-gray-500 text-sm">Buy and sell IP fractional shares on our secure marketplace</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contract Info */}
            {isConnected && isCorrectNetwork && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Deployed Contracts</h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="font-medium text-gray-700 sm:w-1/4">IP NFT Registry:</div>
                    <div className="font-mono text-sm text-gray-600 break-all bg-gray-50 p-2 rounded flex-1">
                      {import.meta.env.VITE_IP_NFT_REGISTRY_CONTRACT}
                    </div>
                    <a 
                      href={`${networkConfig.blockExplorerUrl}/address/${import.meta.env.VITE_IP_NFT_REGISTRY_CONTRACT}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                    >
                      View 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="font-medium text-gray-700 sm:w-1/4">Rule Engine:</div>
                    <div className="font-mono text-sm text-gray-600 break-all bg-gray-50 p-2 rounded flex-1">
                      {import.meta.env.VITE_VELTIS_RULE_ENGINE}
                    </div>
                    <a 
                      href={`${networkConfig.blockExplorerUrl}/address/${import.meta.env.VITE_VELTIS_RULE_ENGINE}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                    >
                      View 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mint' && <MintIPNFTForm onSuccess={handleMintSuccess} />}
        
        {activeTab === 'my-nfts' && <MyIPNFTs ref={myNFTsRef} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-gray-600 font-medium">Veltis</span>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Terms</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Docs</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Contact</a>
            </div>
          </div>
          
          <div className="mt-6 text-center md:text-left">
            <p className="text-gray-500 text-sm">
              © 2024 Veltis - IP NFT Platform on {networkConfig.chainName}
            </p>
          </div>
        </div>
      </footer>

      {/* Add test button in development environment */}
      {import.meta.env.DEV && (
        <div style={{ position: 'fixed', bottom: 10, right: 10, zIndex: 1000 }}>
          <button 
            onClick={testNFTStorage}
            style={{ 
              padding: '8px 16px', 
              background: '#FF5522', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Legacy Storage
          </button>
        </div>
      )}

      {import.meta.env.DEV && (
        <NFTStorageTest />
      )}

      {import.meta.env.DEV && (
        <div style={{ position: 'fixed', bottom: 60, right: 10, zIndex: 1000 }}>
          <button 
            onClick={testIPFS}
            style={{ 
              padding: '8px 16px', 
              background: '#3B82F6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Pinata IPFS
          </button>
        </div>
      )}

      {import.meta.env.DEV && (
        <PinataTest />
      )}

      {/* Success Modal */}
      {showSuccessModal && mintedTokenId && (
        <TransactionSuccessMessage 
          tokenId={mintedTokenId} 
          onClose={handleCloseSuccessModal} 
        />
      )}
    </div>
  );
};

export default App;
