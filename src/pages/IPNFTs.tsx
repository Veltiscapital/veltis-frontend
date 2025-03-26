import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getOwnedIPNFTs, formatEth } from '@/lib/blockchain';
import { truncateAddress } from '@/lib/utils';

interface IPNFT {
  id: string;
  name: string;
  description: string;
  ipType: string;
  owner: string;
  valuation: string;
  uri: string;
  createdAt: number;
  image?: string;
}

const IPNFTs = () => {
  const { isAuthenticated, walletAddress } = useAuth();
  const { toast } = useToast();
  const [ipnfts, setIpnfts] = useState<IPNFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIPNFTs = async () => {
      if (!isAuthenticated || !walletAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const ownedIPNFTs = await getOwnedIPNFTs();
        
        // Fetch metadata for each IPNFT
        const ipnftsWithMetadata = await Promise.all(
          ownedIPNFTs.map(async (ipnft) => {
            try {
              // Fetch metadata from IPFS or other storage
              const response = await fetch(ipnft.uri);
              const metadata = await response.json();
              
              return {
                ...ipnft,
                image: metadata.image || '/placeholder-image.png'
              };
            } catch (error) {
              console.error(`Error fetching metadata for IPNFT ${ipnft.id}:`, error);
              return {
                ...ipnft,
                image: '/placeholder-image.png'
              };
            }
          })
        );
        
        setIpnfts(ipnftsWithMetadata);
      } catch (error) {
        console.error('Error fetching IPNFTs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your IP-NFTs',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIPNFTs();
  }, [isAuthenticated, walletAddress, toast]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
          <p className="mt-4">Please connect your wallet to view your IP-NFTs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My IP-NFTs</h1>
          <p className="text-gray-500 mt-1">
            Manage your intellectual property assets
          </p>
        </div>
        <Link to="/mint">
          <Button>Mint New IP-NFT</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-video w-full">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : ipnfts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold">No IP-NFTs Found</h2>
          <p className="text-gray-500 mt-2">
            You don't have any IP-NFTs yet. Mint your first intellectual property NFT to get started.
          </p>
          <Link to="/mint" className="mt-6 inline-block">
            <Button>Mint Your First IP-NFT</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ipnfts.map((ipnft) => (
            <Card key={ipnft.id} className="overflow-hidden">
              <div className="aspect-video w-full bg-gray-100 relative">
                {ipnft.image ? (
                  <img 
                    src={ipnft.image} 
                    alt={ipnft.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <Badge className="absolute top-2 right-2">
                  {ipnft.ipType}
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle>{ipnft.name}</CardTitle>
                <CardDescription>
                  ID: {ipnft.id} • Valuation: {formatEth(ipnft.valuation)} MATIC
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {ipnft.description || 'No description provided'}
                </p>
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span>Owner: {truncateAddress(ipnft.owner)}</span>
                  <span className="mx-1">•</span>
                  <span>Created: {new Date(ipnft.createdAt * 1000).toLocaleDateString()}</span>
                </div>
              </CardContent>
              
              <CardFooter>
                <Link to={`/ipnft/${ipnft.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default IPNFTs; 