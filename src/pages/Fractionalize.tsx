import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertTriangle, Info, AlertCircle, ArrowLeft, FileText, Layers } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getIPNFTsForOwner } from '@/lib/alchemy';
import { isIPNFTFractionalized } from '@/lib/blockchain';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import FractionalizationForm from '@/components/fractionalization/FractionalizationForm';
import { BLOCKCHAIN_CONFIG } from '@/lib/config';

interface IPNFT {
  id: string;
  name: string;
  title: string;
  description: string;
  ipType: string;
  tokenId: string;
  contract_address: string;
  valuation?: string;
  imageUrl?: string;
  authors?: string;
  institution?: string;
  developmentStage?: string;
  metadataUri?: string;
}

const Fractionalize = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { walletAddress, isAuthenticated, connectWallet } = useAuth();
  
  const [selectedIpnft, setSelectedIpnft] = useState<IPNFT | null>(null);
  const [showFractionalizationForm, setShowFractionalizationForm] = useState(false);
  const [isFractionalized, setIsFractionalized] = useState<boolean>(false);
  const [fractionAddress, setFractionAddress] = useState<string | null>(null);
  
  // Mock data for development and fallback
  const mockIPNFTs = [
    {
      id: '1',
      name: 'Novel Drug Delivery System',
      title: 'Novel Drug Delivery System',
      description: 'A novel drug delivery system for targeted cancer therapy',
      ipType: 'Patent',
      tokenId: '1',
      contract_address: BLOCKCHAIN_CONFIG.CONTRACTS.SIMPLE_IP_NFT_REGISTRY,
      valuation: '50000000000000000000', // 50 MATIC in wei
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
      ipType: 'Patent',
      tokenId: '2',
      contract_address: BLOCKCHAIN_CONFIG.CONTRACTS.SIMPLE_IP_NFT_REGISTRY,
      valuation: '75000000000000000000', // 75 MATIC in wei
      imageUrl: '/placeholder-image.jpg',
      authors: 'Dr. Alex Johnson',
      institution: 'Tech Health Labs',
      developmentStage: 'Preclinical',
    },
  ];
  
  // Fetch user's IP-NFTs using Alchemy SDK
  const { data: ipnfts, isLoading, error: queryError } = useQuery({
    queryKey: ['my-ipnfts-for-fractionalization', walletAddress],
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

  // Check if the selected IP-NFT is already fractionalized
  const checkFractionalizationStatus = async (ipnft: IPNFT) => {
    try {
      const fractionalizationAddress = await isIPNFTFractionalized(
        ipnft.contract_address,
        ipnft.tokenId
      );
      
      if (fractionalizationAddress) {
        setIsFractionalized(true);
        setFractionAddress(fractionalizationAddress);
        return true;
      } else {
        setIsFractionalized(false);
        setFractionAddress(null);
        return false;
      }
    } catch (error) {
      console.error('Error checking fractionalization status:', error);
      return false;
    }
  };

  useEffect(() => {
    if (id && ipnfts) {
      const ipnft = ipnfts.find((nft: IPNFT) => nft.id === id);
      if (ipnft) {
        setSelectedIpnft(ipnft);
        setShowFractionalizationForm(true);
        
        // Check if the IP-NFT is already fractionalized
        checkFractionalizationStatus(ipnft);
      } else {
        toast.error('IP-NFT not found');
        navigate('/dashboard/fractionalize');
      }
    }
  }, [id, ipnfts, navigate]);
  
  const handleSelectIpnft = async (ipnft: IPNFT) => {
    setSelectedIpnft(ipnft);
    
    // Check if the IP-NFT is already fractionalized
    const isAlreadyFractionalized = await checkFractionalizationStatus(ipnft);
    
    if (isAlreadyFractionalized) {
      toast.info('This IP-NFT is already fractionalized');
    }
    
    setShowFractionalizationForm(true);
  };
  
  const handleBackToSelection = () => {
    setSelectedIpnft(null);
    setShowFractionalizationForm(false);
    setIsFractionalized(false);
    setFractionAddress(null);
  };
  
  const handleFractionalizationSuccess = (fractionAddress: string) => {
    toast.success('IP-NFT successfully fractionalized!');
    navigate(`/dashboard/fractions/${fractionAddress}`);
  };
  
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-bold">Loading IP-NFTs...</h2>
          </div>
        </div>
      </div>
    );
  }
  
  // Render authentication required
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please sign in to fractionalize your IP-NFTs.</CardDescription>
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
      </div>
    );
  }
  
  // Render wallet connection required
  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Wallet Connection Required</CardTitle>
              <CardDescription>Please connect your wallet to fractionalize your IP-NFTs.</CardDescription>
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
      </div>
    );
  }
  
  // Render fractionalization form
  if (showFractionalizationForm && selectedIpnft) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8">
          <div className="max-w-3xl mx-auto">
            <Button
              variant="outline"
              onClick={handleBackToSelection}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to IP-NFT Selection
            </Button>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{selectedIpnft.title || selectedIpnft.name}</CardTitle>
                <CardDescription>IP-NFT #{selectedIpnft.tokenId}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  {selectedIpnft.imageUrl && (
                    <div className="w-full md:w-1/3">
                      <img
                        src={selectedIpnft.imageUrl}
                        alt={selectedIpnft.title || selectedIpnft.name}
                        className="w-full h-auto rounded-md"
                      />
                    </div>
                  )}
                  <div className="w-full md:w-2/3">
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedIpnft.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">IP Type</p>
                        <p className="text-sm text-muted-foreground">{selectedIpnft.ipType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Valuation</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedIpnft.valuation 
                            ? `${Number(selectedIpnft.valuation) / 1e18} MATIC` 
                            : 'Not available'}
                        </p>
                      </div>
                      {selectedIpnft.authors && (
                        <div>
                          <p className="text-sm font-medium">Authors</p>
                          <p className="text-sm text-muted-foreground">{selectedIpnft.authors}</p>
                        </div>
                      )}
                      {selectedIpnft.institution && (
                        <div>
                          <p className="text-sm font-medium">Institution</p>
                          <p className="text-sm text-muted-foreground">{selectedIpnft.institution}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {isFractionalized ? (
              <Card>
                <CardHeader>
                  <CardTitle>Already Fractionalized</CardTitle>
                  <CardDescription>This IP-NFT has already been fractionalized.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Fractionalization Exists</AlertTitle>
                    <AlertDescription>
                      This IP-NFT has already been fractionalized. You can view the fractionalization details.
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => navigate(`/dashboard/fractions/${fractionAddress}`)}
                    className="w-full"
                  >
                    View Fractionalization
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <FractionalizationForm
                ipnftId={selectedIpnft.tokenId}
                ipnftContract={selectedIpnft.contract_address}
                ipnftName={selectedIpnft.title || selectedIpnft.name}
                ipnftImage={selectedIpnft.imageUrl}
                onSuccess={handleFractionalizationSuccess}
                onCancel={handleBackToSelection}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Render IP-NFT selection
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Fractionalize IP-NFT</h1>
              <p className="text-muted-foreground mt-2">
                Select an IP-NFT to fractionalize and create tradable tokens
              </p>
            </div>
          </div>
          
          {queryError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{(queryError as Error).message}</AlertDescription>
            </Alert>
          )}
          
          {!ipnfts || ipnfts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No IP-NFTs Found</CardTitle>
                <CardDescription>You don't have any IP-NFTs to fractionalize.</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Mint an IP-NFT</AlertTitle>
                  <AlertDescription>
                    You need to mint an IP-NFT before you can fractionalize it.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate('/dashboard/mint')}>Mint IP-NFT</Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-6">
              <Alert>
                <Layers className="h-4 w-4" />
                <AlertTitle>Select an IP-NFT to Fractionalize</AlertTitle>
                <AlertDescription>
                  Choose one of your IP-NFTs below to create fractional tokens from it.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ipnfts.map((ipnft: IPNFT) => (
                  <Card 
                    key={ipnft.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSelectIpnft(ipnft)}
                  >
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
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg truncate">{ipnft.title || ipnft.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {ipnft.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Type: </span>
                          <span className="font-medium">{ipnft.ipType}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">ID: </span>
                          <span className="font-medium">#{ipnft.tokenId}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Valuation: </span>
                        <span className="font-medium">
                          {ipnft.valuation 
                            ? `${Number(ipnft.valuation) / 1e18} MATIC` 
                            : 'Not available'}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full">
                        <Layers className="h-4 w-4 mr-2" />
                        Fractionalize
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fractionalize; 