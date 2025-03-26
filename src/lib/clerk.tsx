import React from 'react';
import { ClerkProvider, SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

// Your Clerk publishable key
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

// Custom hook to check if user is authenticated
export const useAuth = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  
  return {
    isAuthenticated: isSignedIn,
    isLoading: !isLoaded,
    user,
    userId: user?.id,
    userMetadata: user?.publicMetadata,
    walletAddress: user?.publicMetadata?.walletAddress as string | undefined,
  };
};

// Custom hook for wallet connection
export const useWalletConnection = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const connectMetaMask = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const walletAddress = accounts[0];
      
      // Update user metadata with wallet address
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            walletAddress,
            walletType: 'metamask'
          }
        });
      }
      
      return walletAddress;
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      throw error;
    }
  };

  const connectCoinbaseWallet = async () => {
    try {
      // Dynamically import CoinbaseWalletSDK
      const CoinbaseWalletSDK = (await import('@coinbase/wallet-sdk')).default;
      
      // Initialize Coinbase Wallet SDK
      const coinbaseWallet = new CoinbaseWalletSDK({
        appName: 'Veltis',
        appLogoUrl: '/logo.png',
        darkMode: false
      });
      
      // Initialize a Web3 Provider
      const ethereum = coinbaseWallet.makeWeb3Provider('https://mainnet.infura.io/v3/YOUR_INFURA_KEY', 1);
      
      // Request accounts
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const walletAddress = accounts[0];
      
      // Update user metadata with wallet address
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            walletAddress,
            walletType: 'coinbase'
          }
        });
      }
      
      return walletAddress;
    } catch (error) {
      console.error('Error connecting to Coinbase Wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    if (user) {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          walletAddress: null,
          walletType: null
        }
      });
    }
  };

  return {
    connectMetaMask,
    connectCoinbaseWallet,
    disconnectWallet,
    walletAddress: user?.publicMetadata?.walletAddress as string | undefined,
    walletType: user?.publicMetadata?.walletType as string | undefined,
  };
};

// Types for Clerk provider props
interface ClerkProviderProps {
  children: React.ReactNode;
}

// Clerk provider component
export const ClerkAuthProvider = ({ children }: ClerkProviderProps) => {
  const navigate = useNavigate();
  
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      navigate={(to) => navigate(to)}
    >
      {children}
    </ClerkProvider>
  );
};

// Export Clerk components
export { SignIn, SignUp };

// Add TypeScript declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isWalletConnect?: boolean;
      providers?: any[];
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
      _metamask?: any;
    };
  }
} 