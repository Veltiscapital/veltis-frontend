import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { isAuthenticated, user, walletAddress, connectWallet, disconnectWallet } = useAuth();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold">
            Veltis
          </Link>
          <div className="hidden md:flex ml-8 space-x-4">
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary">
              Dashboard
            </Link>
            <Link to="/dashboard/marketplace" className="text-sm font-medium hover:text-primary">
              Marketplace
            </Link>
            <Link to="/dashboard/my-ipnfts" className="text-sm font-medium hover:text-primary">
              My IP-NFTs
            </Link>
            <Link to="/dashboard/vault" className="text-sm font-medium hover:text-primary">
              Vault
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <div className="hidden md:block text-sm">
                {walletAddress && (
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => disconnectWallet()}>
                Disconnect
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button size="sm" onClick={() => connectWallet()}>
                Connect Wallet
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
