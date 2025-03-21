import React, { useState } from 'react';
import { useWeb3 } from './components/Web3Provider';
import { toast } from 'sonner';
import MintIPNFTForm from './components/MintIPNFTForm';
import MyIPNFTs from './components/MyIPNFTs';

const App: React.FC = () => {
  const { account, isConnected, connectWallet, disconnectWallet, isCorrectNetwork, switchNetwork, chainId, networkConfig } = useWeb3();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mint' | 'my-nfts'>('dashboard');

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

  // Handle NFT minting success
  const handleMintSuccess = (tokenId: string) => {
    // Switch to "My NFTs" tab
    setActiveTab('my-nfts');
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
              onClick={() => setActiveTab('dashboard')}
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
              onClick={() => setActiveTab('mint')}
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
              onClick={() => setActiveTab('my-nfts')}
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
                        onClick={() => setActiveTab('mint')}
                        className="px-6 py-3 bg-white text-indigo-600 rounded-lg shadow-md hover:bg-indigo-50 font-medium transition-colors"
                      >
                        Mint New IP NFT
                      </button>
                      <button 
                        onClick={() => setActiveTab('my-nfts')}
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
        
        {activeTab === 'my-nfts' && <MyIPNFTs />}
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
    </div>
  );
};

export default App;
