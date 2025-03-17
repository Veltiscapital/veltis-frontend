import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle2, WifiOff, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BLOCKCHAIN_CONFIG } from "@/lib/config";
import { NETWORKS } from "@/lib/blockchain";
import { Button } from "@/components/ui/button";

export const NetworkStatus = () => {
  const { chainId, networkName, walletAddress, switchNetwork, connectWallet } = useAuth();
  
  // If no wallet is connected, show connect button
  if (!walletAddress) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 px-3 text-xs border-gray-300 text-gray-600 hover:bg-gray-100"
              onClick={connectWallet}
            >
              <HelpCircle className="h-3 w-3" />
              Connect Wallet
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Connect your wallet to interact with the blockchain</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Check if on correct network
  const targetNetwork = BLOCKCHAIN_CONFIG.NETWORK;
  const expectedChainId = BLOCKCHAIN_CONFIG.CHAIN_IDS[targetNetwork as keyof typeof BLOCKCHAIN_CONFIG.CHAIN_IDS];
  const isCorrectNetwork = chainId === expectedChainId;
  
  // Get proper network display name
  const getNetworkDisplayName = () => {
    if (!chainId) return 'Disconnected';
    
    // Check if it's one of our known networks
    if (chainId === BLOCKCHAIN_CONFIG.CHAIN_IDS['polygon-amoy']) {
      return 'Polygon Amoy Testnet';
    } else if (chainId === BLOCKCHAIN_CONFIG.CHAIN_IDS['polygon-mainnet']) {
      return 'Polygon Mainnet';
    }
    
    // Check for Polygon Mumbai (deprecated)
    if (chainId === 80001) {
      return 'Polygon Mumbai (Deprecated)';
    }
    
    // Fallback to the network name from provider
    return networkName || `Unknown Network (${chainId})`;
  };
  
  // Determine network connection status
  const isConnected = !!chainId;
  const displayNetworkName = getNetworkDisplayName();
  
  // Handle network switch
  const handleSwitchNetwork = async () => {
    if (!isCorrectNetwork) {
      await switchNetwork(targetNetwork as keyof typeof NETWORKS);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isConnected ? (isCorrectNetwork ? "outline" : "destructive") : "destructive"}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-normal cursor-pointer ${
              isConnected && isCorrectNetwork ? 'border-green-300 text-green-700 bg-green-50' :
              'border-red-300 text-red-700 bg-red-50'
            }`}
            onClick={handleSwitchNetwork}
          >
            {!isConnected ? (
              <>
                <WifiOff className="h-3 w-3" />
                Offline
              </>
            ) : isCorrectNetwork ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                {displayNetworkName}
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Switch Network
              </>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">
            {!isConnected
              ? "No blockchain connection detected"
              : isCorrectNetwork 
                ? `Connected to ${displayNetworkName}`
                : `Click to switch to ${targetNetwork === 'polygon-mainnet' ? 'Polygon Mainnet' : 'Polygon Amoy Testnet'}`
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
