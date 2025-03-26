import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Loader2, 
  AlertCircle, 
  ArrowLeft, 
  Layers, 
  DollarSign, 
  Users, 
  FileText, 
  ExternalLink, 
  ShoppingCart,
  TrendingUp,
  Clock
} from 'lucide-react';
import { formatDate, shortenAddress } from '@/lib/utils';

interface FractionDetails {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  imageUrl?: string;
  price: string;
  totalShares: string;
  availableShares: string;
  ipnftId: string;
  ipnftContract: string;
  fractionAddress: string;
  owner: string;
  createdAt: string;
  transactions?: {
    id: string;
    type: 'buy' | 'sell';
    buyer: string;
    seller: string;
    amount: string;
    price: string;
    timestamp: string;
  }[];
}

export default function FractionDetail() {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, walletAddress, connectWallet } = useAuth();
  const [buyAmount, setBuyAmount] = useState('');
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch fraction details
  const { data: fractionDetails, isLoading, error } = useQuery({
    queryKey: ['fraction', address],
    queryFn: async () => {
      if (!address) throw new Error('Fraction address is required');
      const response = await api.fractionalization.getFraction(address);
      return response.data;
    },
    enabled: !!address,
  });

  // Buy fraction mutation
  const buyMutation = useMutation({
    mutationFn: async ({ tokenAddress, amount, price }: { tokenAddress: string; amount: string; price: string }) => {
      return api.fractionalization.buyFractions(tokenAddress, { amount, price });
    },
    onSuccess: () => {
      toast.success('Successfully purchased fraction shares!');
      setBuyDialogOpen(false);
      setBuyAmount('');
    },
    onError: (error) => {
      console.error('Buy error:', error);
      toast.error('Failed to purchase fraction shares. Please try again.');
    },
  });

  const handleBuy = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to buy fraction shares');
      return;
    }

    if (!walletAddress) {
      try {
        await connectWallet();
      } catch (error) {
        toast.error('Please connect your wallet to buy fraction shares');
        return;
      }
    }

    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!fractionDetails || !address) {
      toast.error('Fraction details not available');
      return;
    }

    const amount = buyAmount;
    const price = fractionDetails.price;

    buyMutation.mutate({ tokenAddress: address, amount, price });
  };

  const calculateTotalCost = () => {
    if (!buyAmount || !fractionDetails) return '0';
    return (parseFloat(buyAmount) * parseFloat(fractionDetails.price)).toFixed(6);
  };

  const isOwner = walletAddress && fractionDetails?.owner.toLowerCase() === walletAddress.toLowerCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Fraction Details</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load fraction details. Please try again later.
          </AlertDescription>
        </Alert>
      ) : fractionDetails ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Image and buy section */}
          <div className="lg:col-span-1 space-y-4">
            <div className="border rounded-lg overflow-hidden">
              {fractionDetails.imageUrl ? (
                <img
                  src={fractionDetails.imageUrl}
                  alt={fractionDetails.name}
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center bg-gray-100">
                  <Layers className="h-16 w-16 text-gray-400" />
                </div>
              )}
              <div className="p-4 space-y-4">
                <div>
                  <h2 className="text-xl font-bold">{fractionDetails.name}</h2>
                  <p className="text-sm text-muted-foreground">{fractionDetails.symbol}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price per Share</p>
                    <p className="font-medium">{fractionDetails.price} MATIC</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="font-medium">
                      {fractionDetails.availableShares} / {fractionDetails.totalShares}
                    </p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ 
                      width: `${(Number(fractionDetails.availableShares) / Number(fractionDetails.totalShares)) * 100}%` 
                    }}
                  ></div>
                </div>
                
                {!isOwner && Number(fractionDetails.availableShares) > 0 && (
                  <Button 
                    className="w-full" 
                    onClick={() => setBuyDialogOpen(true)}
                    disabled={!isAuthenticated || !walletAddress}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy Shares
                  </Button>
                )}
                
                {isOwner && (
                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertTitle>You own this fraction</AlertTitle>
                    <AlertDescription>
                      You are the owner of this fractionalized IP-NFT.
                    </AlertDescription>
                  </Alert>
                )}
                
                {Number(fractionDetails.availableShares) === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Sold Out</AlertTitle>
                    <AlertDescription>
                      All shares of this fraction have been sold.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Fraction Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Contract Address</span>
                  <span className="text-sm font-medium">{shortenAddress(fractionDetails.fractionAddress)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Owner</span>
                  <span className="text-sm font-medium">{shortenAddress(fractionDetails.owner)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-medium">{formatDate(fractionDetails.createdAt)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between">
                <Link 
                  to={`/dashboard/ipnft/${fractionDetails.ipnftId}`}
                  className="text-sm text-primary hover:underline flex items-center"
                >
                  <FileText className="mr-1 h-4 w-4" />
                  View Original IP-NFT
                </Link>
                <a 
                  href={`https://mumbai.polygonscan.com/address/${fractionDetails.fractionAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center"
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  View on Explorer
                </a>
              </div>
            </div>
          </div>
          
          {/* Right column - Tabs with details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="transactions" className="flex-1">Transactions</TabsTrigger>
                <TabsTrigger value="holders" className="flex-1">Holders</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6 space-y-6">
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">About {fractionDetails.name}</h3>
                  <p className="text-muted-foreground">
                    {fractionDetails.description || 
                      `${fractionDetails.name} represents fractional ownership of an intellectual property NFT. 
                      Each share gives you partial ownership rights to the underlying IP asset.`}
                  </p>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4 flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Shares</p>
                        <p className="font-medium">{fractionDetails.totalShares}</p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Price per Share</p>
                        <p className="font-medium">{fractionDetails.price} MATIC</p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Market Cap</p>
                        <p className="font-medium">
                          {(parseFloat(fractionDetails.price) * parseFloat(fractionDetails.totalShares)).toFixed(2)} MATIC
                        </p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="font-medium">{formatDate(fractionDetails.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="transactions" className="mt-6">
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">From</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">To</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {fractionDetails.transactions && fractionDetails.transactions.length > 0 ? (
                          fractionDetails.transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-muted/50">
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  tx.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {tx.type === 'buy' ? 'Buy' : 'Sell'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">{tx.amount} shares</td>
                              <td className="px-4 py-3 text-sm">{tx.price} MATIC</td>
                              <td className="px-4 py-3 text-sm">{shortenAddress(tx.seller)}</td>
                              <td className="px-4 py-3 text-sm">{shortenAddress(tx.buyer)}</td>
                              <td className="px-4 py-3 text-sm">{formatDate(tx.timestamp)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                              No transactions found for this fraction.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="holders" className="mt-6">
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Holders</h3>
                  <p className="text-muted-foreground mb-6">
                    This section shows the current distribution of shares among holders.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{shortenAddress(fractionDetails.owner)}</p>
                          <p className="text-xs text-muted-foreground">Owner</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {(Number(fractionDetails.totalShares) - Number(fractionDetails.availableShares)).toString()}
                        </p>
                        <p className="text-xs text-muted-foreground">shares</p>
                      </div>
                    </div>
                    
                    {Number(fractionDetails.availableShares) > 0 && (
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <ShoppingCart className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Available for purchase</p>
                            <p className="text-xs text-muted-foreground">Market</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{fractionDetails.availableShares}</p>
                          <p className="text-xs text-muted-foreground">shares</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : null}
      
      {/* Buy Dialog */}
      <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy Fraction Shares</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Number of Shares</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount to buy"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                min="1"
                max={fractionDetails?.availableShares}
              />
              <p className="text-xs text-muted-foreground">
                Available: {fractionDetails?.availableShares} shares
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Price per Share</Label>
              <div className="p-2 border rounded-md bg-muted/50">
                {fractionDetails?.price} MATIC
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Total Cost</Label>
              <div className="p-2 border rounded-md bg-primary/5 font-medium">
                {calculateTotalCost()} MATIC
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBuy} 
              disabled={buyMutation.isPending || !buyAmount || parseFloat(buyAmount) <= 0}
            >
              {buyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Purchase'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 