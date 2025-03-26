import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IPCardGrid } from '@/components/ui/ip-card-grid';
import { IPCardSkeletonGrid } from '@/components/ui/ip-card-skeleton';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useIPNFTs } from '@/hooks/use-api';
import { getOwnedIPNFTs, formatEth } from '@/lib/blockchain';
import { APP_CONFIG, FEATURES } from '@/lib/config';

const Dashboard: React.FC = () => {
  const { user, walletAddress, isAuthenticated } = useAuth();
  const { data: ipnfts, isLoading: isLoadingIPNFTs } = useIPNFTs<any[]>();
  const [stats, setStats] = useState({
    ownedIPNFTs: 0,
    totalValueLocked: '0',
    fractionalized: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        if (isAuthenticated && walletAddress) {
          // For a real implementation, these would be API calls
          // For demo purposes, we'll use mock data
          const ownedNFTs = await getOwnedIPNFTs();
          
          setStats({
            ownedIPNFTs: ownedNFTs.length,
            totalValueLocked: '5700000', // Mock data
            fractionalized: 2, // Mock data
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, walletAddress]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/dashboard/mint">Mint IP-NFT</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard/fractionalize">Fractionalize</Link>
          </Button>
        </div>
      </div>

      {!walletAddress && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>No wallet connected</AlertTitle>
          <AlertDescription>
            Connect your wallet to access all features.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">IP-NFTs Owned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoadingStats ? '...' : stats.ownedIPNFTs}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/my-ipnfts">View all</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Value Locked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoadingStats ? '...' : `$${parseInt(stats.totalValueLocked).toLocaleString()}`}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/analytics">View analytics</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Fractionalized IP-NFTs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoadingStats ? '...' : stats.fractionalized}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/fractionalize">Fractionalize</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Your IP-NFTs</h2>
        {isLoadingIPNFTs ? (
          <IPCardSkeletonGrid count={3} />
        ) : ipnfts && ipnfts.length > 0 ? (
          <IPCardGrid ipnfts={ipnfts.slice(0, 3)} />
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">You don't have any IP-NFTs yet.</p>
            <Button asChild>
              <Link to="/dashboard/mint">Mint your first IP-NFT</Link>
            </Button>
          </Card>
        )}
      </div>

      <div className="pt-6">
        <Tabs defaultValue="trending">
          <TabsList>
            <TabsTrigger value="trending">Trending IP-NFTs</TabsTrigger>
            <TabsTrigger value="recent">Recently Added</TabsTrigger>
          </TabsList>
          <TabsContent value="trending" className="pt-4">
            {isLoadingIPNFTs ? (
              <IPCardSkeletonGrid count={3} />
            ) : (
              <IPCardGrid ipnfts={ipnfts?.slice(0, 3) || []} />
            )}
          </TabsContent>
          <TabsContent value="recent" className="pt-4">
            {isLoadingIPNFTs ? (
              <IPCardSkeletonGrid count={3} />
            ) : (
              <IPCardGrid ipnfts={ipnfts?.slice(0, 3).reverse() || []} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {FEATURES.ENABLE_CONSULTING && (
        <div className="pt-6">
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle>Need help with your IP tokenization strategy?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our team of experts can help you navigate the complex process of
                tokenizing your intellectual property and creating an effective
                strategy for maximizing its value.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/dashboard/consulting">Book a Consultation</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
