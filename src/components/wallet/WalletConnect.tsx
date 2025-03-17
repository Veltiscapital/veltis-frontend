import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet } from 'lucide-react';
import { toast } from 'sonner';

// SVG icons as components
const MetaMaskIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.8182 1L13.3455 7.89091L14.9727 3.95636L21.8182 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.18182 1L10.5818 7.94545L9.02727 3.95636L2.18182 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.6545 16.8727L16.3636 20.5909L21.2727 22L22.6364 16.9636L18.6545 16.8727Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.37272 16.9636L2.72727 22L7.63636 20.5909L5.34545 16.8727L1.37272 16.9636Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.36364 10.5L5.98181 12.6818L10.8 12.9091L10.6182 7.65454L7.36364 10.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.6364 10.5L13.3273 7.6L13.2 12.9091L18.0182 12.6818L16.6364 10.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.63636 20.5909L10.4727 19.0909L8.02727 17L7.63636 20.5909Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.5273 19.0909L16.3636 20.5909L15.9727 17L13.5273 19.0909Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CoinbaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="white"/>
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" fill="#0052FF"/>
    <path d="M12.0001 16.2C9.06009 16.2 6.7001 13.84 6.7001 10.9C6.7001 7.96 9.06009 5.6 12.0001 5.6C14.9401 5.6 17.3001 7.96 17.3001 10.9C17.3001 13.84 14.9401 16.2 12.0001 16.2ZM10.0001 9.6V12.2L12.0001 13.5L14.0001 12.2V9.6L12.0001 8.3L10.0001 9.6Z" fill="white"/>
  </svg>
);

export function WalletConnect() {
  const { isAuthenticated, connectWallet, disconnectWallet, walletAddress } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in before connecting your wallet');
      return;
    }

    setIsConnecting(true);
    try {
      // Default to connecting MetaMask directly
      await connectWallet('metamask');
    } catch (error) {
      console.error(error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error(error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const shortenAddress = (address: string) => {
    return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
  };

  return (
    <div>
      {walletAddress ? (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            <span>{shortenAddress(walletAddress)}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDisconnect}
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleConnectWallet}
          disabled={isConnecting}
        >
          <Wallet className="h-4 w-4" />
          <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </Button>
      )}
    </div>
  );
} 