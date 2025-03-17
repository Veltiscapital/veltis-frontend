import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useIPNFTs } from "@/hooks/use-api";
import { useAuth } from "@/contexts/AuthContext";
import * as blockchain from "@/lib/blockchain";
import * as alchemy from "@/lib/alchemy";
import { BLOCKCHAIN_CONFIG } from "@/lib/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IPCardGrid } from "@/components/ui/ip-card-grid";
import { IPCardSkeletonGrid } from "@/components/ui/ip-card-skeleton";
import { 
  ArrowRight, 
  Microscope, 
  TrendingUp, 
  Shield, 
  Clock, 
  Loader2, 
  AlertTriangle, 
  Plus,
  BarChart3,
  Layers,
  History,
  FileText,
  Lock
} from "lucide-react";

interface IPNFT {
  id: string;
  name: string;
  description: string;
  status: string;
  valuation: string;
  expiry: string;
  protection: string;
  stage: string;
  owner: string;
  tokenId: string;
  createdAt: string;
  updatedAt: string;
  verificationLevel?: 'Basic' | 'Institutional' | 'Expert Reviewed' | 'Unverified';
  ipType: string;
  developmentStage: string;
}

interface BlockchainNFT {
  id: string;
  name: string;
  description: string;
  ipType: string;
  owner: string;
  valuation: string;
  uri: string;
  createdAt: string;
}

const Dashboard = () => {
  const { user, isAuthenticated, walletAddress, connectWallet } = useAuth();
  const { data: ipNfts, isLoading: isLoadingApi, error: apiError } = useIPNFTs<IPNFT[]>();
  
  const [blockchainNfts, setBlockchainNfts] = useState<BlockchainNFT[]>([]);
  const [isLoadingBlockchain, setIsLoadingBlockchain] = useState<boolean>(false);
  const [blockchainError, setBlockchainError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  const isLoading = isLoadingApi || isLoadingBlockchain;
  const error = apiError || blockchainError;
  
  useEffect(() => {
    const fetchBlockchainNFTs = async () => {
      if (!isAuthenticated || !walletAddress) return;
      
      try {
        setIsLoadingBlockchain(true);
        setBlockchainError(null);
        
        // Try to get NFTs using Alchemy SDK first
        try {
          // Get the contract address from config
          const contractAddress = BLOCKCHAIN_CONFIG.CONTRACTS.IP_NFT_REGISTRY;
          
          // Get NFTs from Alchemy
          const alchemyNfts = await alchemy.getNFTsForOwner(walletAddress);
          console.log('Alchemy NFTs:', alchemyNfts);
          
          // Filter NFTs to only include those from our contract
          const ipNfts = alchemyNfts.ownedNfts.filter(nft => 
            nft.contract.address.toLowerCase() === contractAddress.toLowerCase()
          );
          
          if (ipNfts.length > 0) {
            // Transform Alchemy NFTs to our format
            const transformedNfts = ipNfts.map(nft => {
              let tokenUriString = '';
              if (nft.tokenUri) {
                if (typeof nft.tokenUri === 'string') {
                  tokenUriString = nft.tokenUri;
                } else if (typeof nft.tokenUri === 'object') {
                  // Use type assertion to handle the raw property
                  const tokenUriObj = nft.tokenUri as { raw?: string };
                  if (tokenUriObj.raw) {
                    tokenUriString = tokenUriObj.raw;
                  }
                }
              }
              
              return {
                id: nft.tokenId,
                name: nft.name || 'Untitled IP-NFT',
                description: nft.description || 'No description available',
                ipType: 'Patent', // Default type
                owner: walletAddress,
                valuation: '1.0', // Default valuation
                uri: tokenUriString,
                createdAt: new Date().toISOString(),
              };
            });
            
            setBlockchainNfts(transformedNfts);
            return;
          }
        } catch (alchemyError) {
          console.error('Alchemy error:', alchemyError);
          // Continue to fallback method
        }
        
        // Fallback: Get NFTs using our blockchain utility
        const nfts = await blockchain.getOwnedIPNFTs();
        setBlockchainNfts(nfts);
      } catch (error) {
        console.error('Error fetching blockchain NFTs:', error);
        setBlockchainError('Failed to fetch your IP-NFTs from the blockchain.');
      } finally {
        setIsLoadingBlockchain(false);
      }
    };
    
    fetchBlockchainNFTs();
  }, [isAuthenticated, walletAddress]);
  
  // Combine API and blockchain NFTs
  const allNfts = [
    ...(ipNfts || []).map(nft => ({
      ...nft,
      source: 'api',
      ipType: nft.ipType || 'Patent',
      developmentStage: nft.stage || 'Discovery',
      verificationLevel: nft.verificationLevel || 'Unverified'
    })),
    ...(blockchainNfts || []).map(nft => ({
      id: nft.id,
      name: nft.name,
      description: nft.description,
      status: 'active',
      valuation: nft.valuation,
      expiry: '',
      protection: '',
      stage: 'Discovery',
      owner: nft.owner,
      tokenId: nft.id,
      createdAt: nft.createdAt,
      updatedAt: nft.createdAt,
      source: 'blockchain',
      ipType: nft.ipType,
      developmentStage: 'Discovery',
      verificationLevel: 'Unverified' as const
    }))
  ];
  
  // Filter NFTs based on active tab
  const filteredNfts = allNfts.filter(nft => {
    if (activeTab === 'all') return true;
    if (activeTab === 'verified') return nft.verificationLevel !== 'Unverified';
    if (activeTab === 'unverified') return nft.verificationLevel === 'Unverified';
    return true;
  });

  function renderContent() {
    if (!isAuthenticated) {
      return (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please sign in and connect your wallet to view your dashboard.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={() => connectWallet()}
            >
              Connect Wallet
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    
    if (isLoading) {
      return <IPCardSkeletonGrid count={6} />;
    }
    
    if (error) {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {typeof error === 'string' ? error : 'Failed to load IP-NFTs. Please try again.'}
          </AlertDescription>
        </Alert>
      );
    }
    
    if (filteredNfts.length === 0) {
      return (
        <div className="text-center py-12 border rounded-lg">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No IP-NFTs Found</h3>
          <p className="text-muted-foreground mb-6">
            You don't have any IP-NFTs yet. Start by minting your first intellectual property NFT.
          </p>
          <Button asChild>
            <Link to="/dashboard/mint">
              <Plus className="mr-2 h-4 w-4" />
              Mint New IP-NFT
            </Link>
          </Button>
        </div>
      );
    }
    
    return <IPCardGrid ipnfts={filteredNfts} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your intellectual property NFTs
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/dashboard/mint">
              <Plus className="mr-2 h-4 w-4" />
              Mint New IP-NFT
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All IP-NFTs</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="unverified">Unverified</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {renderContent()}
        </TabsContent>
        
        <TabsContent value="verified" className="mt-6">
          {renderContent()}
        </TabsContent>
        
        <TabsContent value="unverified" className="mt-6">
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
