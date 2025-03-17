import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { api } from '@/lib/api';
import { AUTH_CONFIG } from '@/lib/config';
import { User } from '@/hooks/use-api';
import { toast } from 'sonner';
import * as blockchain from '@/lib/blockchain';
import { useClerk, useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

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
  switchNetwork: (networkName: keyof typeof blockchain.NETWORKS) => Promise<boolean>;
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
  
  // Clerk integration
  const { signOut } = useClerk();
  const { isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useClerkAuth();

  // Initialize Web3Modal
  useEffect(() => {
    blockchain.initWeb3Modal();
  }, []);

  // Check authentication status on mount and when Clerk auth changes
  useEffect(() => {
    checkAuth();
  }, [isSignedIn, clerkUser]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleWalletConnection);
      window.ethereum.on('chainChanged', () => window.location.reload());
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleWalletConnection);
        window.ethereum.removeListener('chainChanged', () => {});
      };
    }
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is signed in with Clerk
      if (isSignedIn && clerkUser) {
        // Get the JWT token from Clerk
        const token = await getToken();
        
        // Store the token
        if (token) {
          localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN, token);
          
          // Get user data from API
          try {
            const response = await api.user.getProfile();
            if (response.data.success) {
              setUser(response.data.data);
              
              // Check if the user has a wallet address stored in Clerk metadata
              const storedWalletAddress = clerkUser.unsafeMetadata?.walletAddress as string;
              if (storedWalletAddress) {
                setWalletAddress(storedWalletAddress);
              } else {
                // Check if wallet is connected
                await handleWalletConnection();
              }
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        }
      } else {
        // Check if we have a stored wallet address
        const storedAddress = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.WALLET_ADDRESS);
        if (storedAddress) {
          // Try to reconnect wallet
          try {
            await connectWallet();
          } catch (error) {
            console.error('Failed to reconnect wallet:', error);
            localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.WALLET_ADDRESS);
            localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
            setWalletAddress(null);
            setUser(null);
          }
        } else {
          setWalletAddress(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnection = async () => {
    try {
      // Check if wallet is connected
      if (blockchain.isWalletConnected()) {
        const address = await blockchain.getAddress();
        setWalletAddress(address);
        
        // Get network information
        const provider = blockchain.getProvider();
        if (provider) {
          const network = await provider.getNetwork();
          setChainId(network.chainId);
          
          // Set network name
          const networkEntries = Object.entries(blockchain.NETWORKS);
          for (const [name, config] of networkEntries) {
            const chainIdHex = config.chainId;
            const chainIdDec = parseInt(chainIdHex, 16);
            if (chainIdDec === network.chainId) {
              setNetworkName(name);
              break;
            }
          }
          
          // If user is signed in with Clerk, update their metadata
          if (isSignedIn && clerkUser && address) {
            try {
              await clerkUser.update({
                unsafeMetadata: {
                  ...clerkUser.unsafeMetadata,
                  walletAddress: address
                }
              });
            } catch (error) {
              console.error('Error updating Clerk metadata:', error);
            }
          }
        }
      } else {
        setWalletAddress(null);
        setChainId(null);
        setNetworkName(null);
      }
    } catch (error) {
      console.error('Wallet connection check error:', error);
      setWalletAddress(null);
      setChainId(null);
      setNetworkName(null);
    }
  };

  const connectWallet = async (provider?: 'metamask' | 'coinbase') => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      // Connect wallet based on provider
      if (provider === 'coinbase') {
        // Connect with Coinbase Wallet
        await blockchain.connectWallet('coinbase');
      } else {
        // Default to MetaMask
        await blockchain.connectWallet('metamask');
      }
      
      // Get wallet address
      const address = await blockchain.getAddress();
      setWalletAddress(address);
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.WALLET_ADDRESS, address);
      
      // Get network information
      const web3Provider = blockchain.getProvider();
      if (web3Provider) {
        const network = await web3Provider.getNetwork();
        setChainId(network.chainId);
        
        // Set network name
        const networkEntries = Object.entries(blockchain.NETWORKS);
        for (const [name, config] of networkEntries) {
          const chainIdHex = config.chainId;
          const chainIdDec = parseInt(chainIdHex, 16);
          if (chainIdDec === network.chainId) {
            setNetworkName(name);
            break;
          }
        }
      }
      
      // If user is signed in with Clerk, update their metadata
      if (isSignedIn && clerkUser && address) {
        try {
          await clerkUser.update({
            unsafeMetadata: {
              ...clerkUser.unsafeMetadata,
              walletAddress: address
            }
          });
        } catch (error) {
          console.error('Error updating Clerk metadata:', error);
        }
      }
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Wallet connection error:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect wallet');
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await blockchain.disconnectWallet();
      
      // Clear local storage
      localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.WALLET_ADDRESS);
      
      // Reset state
      setWalletAddress(null);
      setChainId(null);
      setNetworkName(null);
      
      // If user is signed in with Clerk, update their metadata
      if (isSignedIn && clerkUser) {
        try {
          await clerkUser.update({
            unsafeMetadata: {
              ...clerkUser.unsafeMetadata,
              walletAddress: null
            }
          });
        } catch (error) {
          console.error('Error updating Clerk metadata:', error);
        }
      }
      
      toast.success('Wallet disconnected successfully!');
    } catch (error) {
      console.error('Wallet disconnection error:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const switchNetwork = async (networkName: keyof typeof blockchain.NETWORKS) => {
    try {
      const success = await blockchain.switchNetwork(networkName);
      if (success) {
        // Update network information
        const provider = blockchain.getProvider();
        if (provider) {
          const network = await provider.getNetwork();
          setChainId(network.chainId);
          setNetworkName(networkName);
        }
        
        toast.success(`Switched to ${networkName} successfully!`);
      }
      return success;
    } catch (error) {
      console.error('Network switch error:', error);
      toast.error('Failed to switch network');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!isSignedIn,
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
