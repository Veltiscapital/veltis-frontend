import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertCircle, FileText, Layers, Info } from 'lucide-react';
import { getIPNFTsForOwner } from '@/lib/alchemy';
import { toast } from 'sonner';

interface IPNFT {
  id: string;
  name: string;
  title: string;
  description: string;
  ipType: string;
  tokenId: string;
  contract_address: string;
  imageUrl?: string;
  authors?: string;
  institution?: string;
  developmentStage?: string;
  metadataUri?: string;
}

export default function MyIPNFTs() {
  const navigate = useNavigate();
  const { isAuthenticated, walletAddress, connectWallet } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  // Mock data for development and fallback
  const mockIPNFTs = [
    {
      id: '1',
      name: 'Novel Drug Delivery System',
      title: 'Novel Drug Delivery System',
      description: 'A novel drug delivery system for targeted cancer therapy',
      ipType: 'patent',
      tokenId: '1',
      contract_address: '0x123456789abcdef',
      imageUrl: '/placeholder-image.jpg',
      authors: 'Dr. Jane Smith, Dr. John Doe',
      institution: 'Medical Research Institute',
      developmentStage: 'Phase II',
    },
    {
      id: '2',
      name: 'AI-Powered Diagnostic Tool',
      title: 'AI-Powered Diagnostic Tool',
      description: 'An artificial intelligence system for early disease detection',
      ipType: 'patent',
      tokenId: '2',
      contract_address: '0x123456789abcdef',
      imageUrl: '/placeholder-image.jpg',
      authors: 'Dr. Alex Johnson',
      institution: 'Tech Health Labs',
      developmentStage: 'Preclinical',
    },
  ];

  // Fetch IP-NFTs using Alchemy SDK
  const { data: ipnfts, isLoading, error } = useQuery({
    queryKey: ['my-ipnfts', walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        return [];
      }
      
      try {
        // Fetch IP-NFTs from Alchemy
        const nfts = await getIPNFTsForOwner(walletAddress);
        
        // If no NFTs found, return mock data during development
        if (nfts.length === 0 && import.meta.env.DEV) {
          console.log('No IP-NFTs found, using mock data for development');
          return mockIPNFTs;
        }
        
        return nfts;
      } catch (error) {
        console.error('Error fetching IP-NFTs:', error);
        
        // In development, fall back to mock data
        if (import.meta.env.DEV) {
          console.log('Error fetching IP-NFTs, using mock data for development');
          return mockIPNFTs;
        }
        
        throw error;
      }
    },
    enabled: !!walletAddress && isAuthenticated,
  });

  // Filter IP-NFTs based on active tab
  const filteredIPNFTs = ipnfts?.filter((ipnft: IPNFT) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'verified') return ipnft.developmentStage === 'Phase III' || ipnft.developmentStage === 'Approved';
    if (activeTab === 'unverified') return ipnft.developmentStage !== 'Phase III' && ipnft.developmentStage !== 'Approved';
    return true;
  });

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected successfully');
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">My IP-NFTs</h1>
          <Button onClick={() => navigate('/dashboard/mint')}>Mint New IP-NFT</Button>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All IP-NFTs</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="unverified">Unverified</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video w-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Render authentication required
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">My IP-NFTs</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your IP-NFTs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Sign In Required</AlertTitle>
              <AlertDescription>
                You need to sign in to access this feature.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/sign-in')}>Sign In</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render wallet connection required
  if (!walletAddress) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">My IP-NFTs</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Wallet Connection Required</CardTitle>
            <CardDescription>Please connect your wallet to view your IP-NFTs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Connect Wallet</AlertTitle>
              <AlertDescription>
                You need to connect your wallet to access this feature.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={handleConnectWallet}>Connect Wallet</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">My IP-NFTs</h1>
          <Button onClick={() => navigate('/dashboard/mint')}>Mint New IP-NFT</Button>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load your IP-NFTs. Please try again later.
          </AlertDescription>
        </Alert>
        
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  // Render empty state
  if (!ipnfts || ipnfts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">My IP-NFTs</h1>
          <Button onClick={() => navigate('/dashboard/mint')}>Mint New IP-NFT</Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>No IP-NFTs Found</CardTitle>
            <CardDescription>You don't have any IP-NFTs yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Get Started</AlertTitle>
              <AlertDescription>
                Mint your first IP-NFT to get started with protecting your intellectual property.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/dashboard/mint')}>Mint IP-NFT</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render IP-NFTs
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">My IP-NFTs</h1>
        <Button onClick={() => navigate('/dashboard/mint')}>Mint New IP-NFT</Button>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All IP-NFTs</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="unverified">Unverified</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {filteredIPNFTs.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No IP-NFTs Found</CardTitle>
                <CardDescription>No IP-NFTs match the selected filter.</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Try Another Filter</AlertTitle>
                  <AlertDescription>
                    Try selecting a different filter or mint a new IP-NFT.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setActiveTab('all')} variant="outline" className="mr-2">
                  View All
                </Button>
                <Button onClick={() => navigate('/dashboard/mint')}>Mint IP-NFT</Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIPNFTs.map((ipnft: IPNFT) => (
                <Card key={ipnft.id} className="overflow-hidden">
                  <div className="aspect-video w-full overflow-hidden">
                    {ipnft.imageUrl ? (
                      <img
                        src={ipnft.imageUrl}
                        alt={ipnft.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">{ipnft.title || ipnft.name}</CardTitle>
                    <CardDescription>IP-NFT #{ipnft.tokenId}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {ipnft.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {ipnft.ipType}
                      </span>
                      {ipnft.developmentStage && (
                        <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                          {ipnft.developmentStage}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/dashboard/fractionalize/${ipnft.id}`)}
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      Fractionalize
                    </Button>
                    <Button 
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/dashboard/ipnft/${ipnft.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 