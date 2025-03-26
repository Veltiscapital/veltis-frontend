import { Button } from "@/components/ui/button";
import { Menu, Loader2, Home, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NetworkStatus } from "@/components/wallet/NetworkStatus";

export const Navbar = () => {
  const { isAuthenticated, isLoading, connectWallet, disconnectWallet, walletAddress } = useAuth();
  
  // Format wallet address for display
  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-medium bg-gradient-to-r from-veltis-blue to-veltis-purple bg-clip-text text-transparent font-redhat">
          veltis
        </Link>
        
        {isAuthenticated && (
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link to="/mint" className="text-gray-600 hover:text-gray-900 transition-colors">
              Mint IP-NFT
            </Link>
            <Link to="/ipnfts" className="text-gray-600 hover:text-gray-900 transition-colors">
              My IP-NFTs
            </Link>
            <Link to="/vault" className="text-gray-600 hover:text-gray-900 transition-colors">
              Vault
            </Link>
            <Link to="/analytics" className="text-gray-600 hover:text-gray-900 transition-colors">
              Analytics
            </Link>
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <Button variant="outline" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading
            </Button>
          ) : isAuthenticated && walletAddress ? (
            <>
              <NetworkStatus />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    {formatWalletAddress(walletAddress)}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center cursor-pointer w-full">
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/ipnfts" className="flex items-center cursor-pointer w-full">
                      <Home className="mr-2 h-4 w-4" />
                      My IP-NFTs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/vault" className="flex items-center cursor-pointer w-full">
                      <Home className="mr-2 h-4 w-4" />
                      My Vault
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => disconnectWallet()} className="cursor-pointer text-red-500 hover:text-red-700">
                    Disconnect Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition-opacity"
              onClick={() => {
                console.log('Connect Wallet button clicked');
                connectWallet();
              }}
              aria-label="Connect Wallet"
            >
              Connect Wallet
            </Button>
          )}
          
          {isAuthenticated && (
            <Button className="md:hidden" variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
