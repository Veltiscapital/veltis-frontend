import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, Split, BarChart3, FileText, Coins, Database } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, connectWallet } = useAuth();

  const handleConnectWallet = async () => {
    try {
      await connectWallet('metamask');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
          Tokenize and Fractionalize Your Intellectual Property
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Veltis is a platform for creating, managing, and trading IP-NFTs. 
          Unlock the value of your intellectual property through tokenization and fractionalization.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard/my-ipnfts">
                <Button size="lg" className="px-8">
                  My IP-NFTs
                </Button>
              </Link>
              <Link to="/dashboard/mint">
                <Button size="lg" variant="outline" className="px-8">
                  Mint New IP-NFT
                </Button>
              </Link>
            </>
          ) : (
            <Button size="lg" className="px-8" onClick={handleConnectWallet}>
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <CardTitle>Tokenize IP</CardTitle>
            </div>
            <CardDescription>Convert intellectual property into NFTs</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Transform your patents, trademarks, copyrights, and other intellectual property into 
              non-fungible tokens on the blockchain, creating a verifiable digital representation.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/dashboard/mint" className="text-blue-600 hover:underline">
              Learn more about IP-NFTs
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Split className="h-6 w-6 text-purple-600" />
              <CardTitle>Fractionalize</CardTitle>
            </div>
            <CardDescription>Split ownership into tradable shares</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Divide your IP-NFT into multiple ERC-20 tokens, enabling partial ownership, 
              easier trading, and broader access to investment opportunities.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/dashboard/fractionalize" className="text-blue-600 hover:underline">
              Explore fractionalization
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-green-600" />
              <CardTitle>Trade & Invest</CardTitle>
            </div>
            <CardDescription>Buy and sell IP assets</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Participate in the IP marketplace by buying, selling, or investing in 
              intellectual property assets, creating new opportunities for creators and investors.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/dashboard/marketplace" className="text-blue-600 hover:underline">
              Visit the marketplace
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* How It Works Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
            <p className="text-gray-600">Connect your Ethereum wallet to get started with the platform.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Mint IP-NFT</h3>
            <p className="text-gray-600">Create a digital representation of your intellectual property as an NFT.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Split className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fractionalize</h3>
            <p className="text-gray-600">Optionally split your IP-NFT into multiple tradable tokens.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Trade & Manage</h3>
            <p className="text-gray-600">Buy, sell, and manage your intellectual property assets.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          Join the future of intellectual property management and unlock new value from your IP assets.
        </p>
        {isAuthenticated ? (
          <Link to="/dashboard/mint">
            <Button size="lg" className="px-8">
              Mint Your First IP-NFT
            </Button>
          </Link>
        ) : (
          <Button size="lg" className="px-8" onClick={handleConnectWallet}>
            <Wallet className="mr-2 h-5 w-5" />
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  );
};

export default Home; 