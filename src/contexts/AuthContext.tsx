import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  walletAddress?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  connectWallet: (provider?: 'metamask' | 'coinbase') => Promise<void>;
  disconnectWallet: () => Promise<void>;
  walletAddress: string | null;
  chainId: number | null;
  networkName: string | null;
  switchNetwork: (networkName: string) => Promise<boolean>;
}

// Create the context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isConnecting: false,
  connectionError: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  walletAddress: null,
  chainId: null,
  networkName: null,
  switchNetwork: async () => false,
});

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Simulate authentication check on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, we'll just check if there's a stored user in localStorage
        const storedUser = localStorage.getItem('veltis_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
        
        // Check if wallet is connected
        if (typeof window !== 'undefined' && window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              setWalletAddress(accounts[0]);
              
              // Get network info
              const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
              const chainIdDecimal = parseInt(chainIdHex, 16);
              setChainId(chainIdDecimal);
              
              // Set network name based on chain ID
              if (chainIdDecimal === 1) {
                setNetworkName('Ethereum Mainnet');
              } else if (chainIdDecimal === 137) {
                setNetworkName('Polygon Mainnet');
              } else if (chainIdDecimal === 80001) {
                setNetworkName('Polygon Mumbai');
              } else if (chainIdDecimal === 31337) {
                setNetworkName('Hardhat Local');
              } else {
                setNetworkName('Unknown Network');
              }
            }
          } catch (error) {
            console.error('Error checking wallet connection:', error);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Connect wallet function
  const connectWallet = async (provider?: 'metamask' | 'coinbase') => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        
        // Get network info
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const chainIdDecimal = parseInt(chainIdHex, 16);
        setChainId(chainIdDecimal);
        
        // Set network name based on chain ID
        if (chainIdDecimal === 1) {
          setNetworkName('Ethereum Mainnet');
        } else if (chainIdDecimal === 137) {
          setNetworkName('Polygon Mainnet');
        } else if (chainIdDecimal === 80001) {
          setNetworkName('Polygon Mumbai');
        } else if (chainIdDecimal === 31337) {
          setNetworkName('Hardhat Local');
        } else {
          setNetworkName('Unknown Network');
        }
        
        // For demo purposes, create a user if not already authenticated
        if (!isAuthenticated) {
          const demoUser = {
            id: '1',
            name: 'Demo User',
            email: 'demo@example.com',
            walletAddress: accounts[0]
          };
          
          setUser(demoUser);
          setIsAuthenticated(true);
          localStorage.setItem('veltis_user', JSON.stringify(demoUser));
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async () => {
    try {
      // Clear wallet state
      setWalletAddress(null);
      setChainId(null);
      setNetworkName(null);
      
      // For demo purposes, we'll also log out the user
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('veltis_user');
    } catch (error) {
      console.error('Wallet disconnection error:', error);
    }
  };

  // Switch network function
  const switchNetwork = async (networkName: string): Promise<boolean> => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('No Ethereum provider found');
      }
      
      let chainId: string;
      
      // Determine chain ID based on network name
      switch (networkName.toLowerCase()) {
        case 'ethereum':
        case 'mainnet':
          chainId = '0x1'; // Ethereum Mainnet
          break;
        case 'polygon':
          chainId = '0x89'; // Polygon Mainnet
          break;
        case 'mumbai':
          chainId = '0x13881'; // Polygon Mumbai Testnet
          break;
        case 'hardhat':
        case 'localhost':
          chainId = '0x7A69'; // Hardhat Local (31337)
          break;
        default:
          throw new Error(`Unsupported network: ${networkName}`);
      }
      
      try {
        // Request network switch
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
        
        // Update state with new network info
        const chainIdDecimal = parseInt(chainId, 16);
        setChainId(chainIdDecimal);
        
        if (chainIdDecimal === 1) {
          setNetworkName('Ethereum Mainnet');
        } else if (chainIdDecimal === 137) {
          setNetworkName('Polygon Mainnet');
        } else if (chainIdDecimal === 80001) {
          setNetworkName('Polygon Mumbai');
        } else if (chainIdDecimal === 31337) {
          setNetworkName('Hardhat Local');
        } else {
          setNetworkName('Unknown Network');
        }
        
        return true;
      } catch (error: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (error.code === 4902) {
          // For simplicity, we're not implementing the add network functionality here
          throw new Error(`Network ${networkName} not available in your wallet. Please add it manually.`);
        }
        throw error;
      }
    } catch (error) {
      console.error('Network switch error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isConnecting,
        connectionError,
        connectWallet,
        disconnectWallet,
        walletAddress,
        chainId,
        networkName,
        switchNetwork,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
