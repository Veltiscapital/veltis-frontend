import React, { useState, useEffect } from 'react';
import { Button, Menu, MenuItem, Typography, Box, CircularProgress } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { toast } from 'react-toastify';

// Configure connectors
const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 1337, 31337] // Mainnet, Ropsten, Rinkeby, Goerli, Kovan, local
});

const walletconnect = new WalletConnectConnector({
  rpc: {
    1: process.env.REACT_APP_RPC_URL_1 || 'https://mainnet.infura.io/v3/your-infura-key',
    3: process.env.REACT_APP_RPC_URL_3 || 'https://ropsten.infura.io/v3/your-infura-key',
    4: process.env.REACT_APP_RPC_URL_4 || 'https://rinkeby.infura.io/v3/your-infura-key',
    5: process.env.REACT_APP_RPC_URL_5 || 'https://goerli.infura.io/v3/your-infura-key',
    42: process.env.REACT_APP_RPC_URL_42 || 'https://kovan.infura.io/v3/your-infura-key',
  },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
});

const ConnectWalletButton: React.FC = () => {
  const { activate, deactivate, account, active, error, chainId } = useWeb3React();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [connecting, setConnecting] = useState(false);
  const open = Boolean(anchorEl);
  
  // Handle click event for opening wallet options menu
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Close the wallet options menu
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Connect to MetaMask
  const connectMetaMask = async () => {
    handleClose();
    setConnecting(true);
    
    try {
      await activate(injected, undefined, true);
      toast.success('Connected to MetaMask');
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      toast.error(error.message || 'Failed to connect to MetaMask');
    } finally {
      setConnecting(false);
    }
  };
  
  // Connect to WalletConnect
  const connectWalletConnect = async () => {
    handleClose();
    setConnecting(true);
    
    try {
      await activate(walletconnect, undefined, true);
      toast.success('Connected with WalletConnect');
    } catch (error: any) {
      console.error('Error connecting with WalletConnect:', error);
      toast.error(error.message || 'Failed to connect with WalletConnect');
    } finally {
      setConnecting(false);
    }
  };
  
  // Disconnect wallet
  const disconnect = async () => {
    handleClose();
    
    try {
      deactivate();
      toast.info('Wallet disconnected');
    } catch (error: any) {
      console.error('Error disconnecting wallet:', error);
      toast.error(error.message || 'Failed to disconnect wallet');
    }
  };
  
  // Handle wallet connection errors
  useEffect(() => {
    if (error) {
      console.error('Web3 connection error:', error);
      toast.error(error.message || 'Error connecting to wallet');
      setConnecting(false);
    }
  }, [error]);
  
  // Format the address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Check if the current network is supported
  const isNetworkSupported = () => {
    const supportedChainIds = [1, 3, 4, 5, 42, 1337, 31337];
    return chainId && supportedChainIds.includes(chainId);
  };
  
  // Get network name based on chainId
  const getNetworkName = () => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 3:
        return 'Ropsten Testnet';
      case 4:
        return 'Rinkeby Testnet';
      case 5:
        return 'Goerli Testnet';
      case 42:
        return 'Kovan Testnet';
      case 1337:
      case 31337:
        return 'Local Network';
      default:
        return 'Unknown Network';
    }
  };
  
  // Render the wallet button based on connection state
  if (active && account) {
    return (
      <Box>
        <Button
          variant="outlined"
          color={isNetworkSupported() ? "primary" : "error"}
          onClick={handleClick}
          startIcon={<AccountBalanceWalletIcon />}
        >
          {formatAddress(account)}
        </Button>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <MenuItem disabled>
            <Typography variant="body2" color="textSecondary">
              {getNetworkName()}
            </Typography>
          </MenuItem>
          <MenuItem onClick={disconnect}>Disconnect</MenuItem>
        </Menu>
      </Box>
    );
  }
  
  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        onClick={connecting ? undefined : handleClick}
        startIcon={connecting ? <CircularProgress size={20} color="inherit" /> : <AccountBalanceWalletIcon />}
        disabled={connecting}
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={connectMetaMask}>MetaMask</MenuItem>
        <MenuItem onClick={connectWalletConnect}>WalletConnect</MenuItem>
      </Menu>
    </Box>
  );
};

export default ConnectWalletButton; 