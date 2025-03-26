import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, truncateAddress } from '@/lib/utils';
import { ipnft as ipnftApi } from '@/lib/api';
import { transferIPNFT } from '@/lib/blockchain';

interface IPNFTDetail {
  id: string;
  title: string;
  description: string;
  token_id?: string;
  contract_address?: string;
  ipfs_document_cid?: string;
  ipfs_metadata_uri?: string;
  ip_type: string;
  development_stage: string;
  filing_date?: string;
  expiration_date?: string;
  valuation?: number;
  is_verified?: boolean;
  is_fractionalized?: boolean;
  created_at: string;
  authors?: string[];
  institution?: string;
  owner?: {
    id: string;
    wallet_address: string;
    name?: string;
  };
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  blockchain_tx_hash: string;
  created_at: string;
  seller?: {
    wallet_address: string;
    name?: string;
  };
  buyer?: {
    wallet_address: string;
    name?: string;
  };
}

const IPNFTDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { walletAddress } = useAuth();
  
  const [ipnft, setIpnft] = useState<IPNFTDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transferAddress, setTransferAddress] = useState('');
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isListingDialogOpen, setIsListingDialogOpen] = useState(false);
  const [isFractionDialogOpen, setIsFractionDialogOpen] = useState(false);
  const [listingPrice, setListingPrice] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [listingLoading, setListingLoading] = useState(false);
  
  // PDF viewer state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchIPNFT = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await ipnftApi.getIPNFT(id);
        setIpnft(data);
        
        // If there's an IPFS document CID, create the PDF URL
        if (data.ipfs_document_cid) {
          setPdfUrl(`https://ipfs.io/ipfs/${data.ipfs_document_cid}`);
        }
        
        // Fetch transaction history
        // This would be a separate API call in a real implementation
        setTransactions([
          {
            id: '1',
            transaction_type: 'mint',
            amount: 0,
            currency: 'MATIC',
            blockchain_tx_hash: '0x123...456',
            created_at: new Date().toISOString(),
            buyer: {
              wallet_address: data.owner?.wallet_address || '',
              name: data.owner?.name || 'Unknown'
            }
          }
        ]);
      } catch (error) {
        console.error('Error fetching IPNFT:', error);
        toast({
          title: 'Error',
          description: 'Failed to load IPNFT details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchIPNFT();
  }, [id, toast]);
  
  const handleTransfer = async () => {
    if (!ipnft?.token_id || !transferAddress) return;
    
    try {
      setTransferLoading(true);
      
      // Call the blockchain function to transfer the IPNFT
      const receipt = await transferIPNFT(ipnft.token_id, transferAddress);
      
      toast({
        title: 'Success',
        description: 'IPNFT transferred successfully',
      });
      
      // Close the dialog and refresh data
      setIsTransferDialogOpen(false);
      setTransferAddress('');
      
      // In a real app, you would update the IPNFT data or refetch it
    } catch (error) {
      console.error('Error transferring IPNFT:', error);
      toast({
        title: 'Error',
        description: 'Failed to transfer IPNFT',
        variant: 'destructive'
      });
    } finally {
      setTransferLoading(false);
    }
  };
  
  const handleCreateListing = async () => {
    if (!ipnft?.id || !listingPrice) return;
    
    try {
      setListingLoading(true);
      
      // Call the API to create a listing
      // This would be implemented in the real app
      // await marketplaceApi.createListing(ipnft.id, parseFloat(listingPrice));
      
      toast({
        title: 'Success',
        description: 'Listing created successfully',
      });
      
      // Close the dialog
      setIsListingDialogOpen(false);
      setListingPrice('');
      
      // Navigate to marketplace or refresh data
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to create listing',
        variant: 'destructive'
      });
    } finally {
      setListingLoading(false);
    }
  };
  
  const handleFractionalize = () => {
    // Navigate to the fractionalization page with the IPNFT ID
    navigate(`/fractionalize/${id}`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!ipnft) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">IPNFT Not Found</h1>
          <p className="mt-4">The requested IPNFT could not be found.</p>
          <Button 
            className="mt-6" 
            onClick={() => navigate('/ipnfts')}
          >
            Back to My IP-NFTs
          </Button>
        </div>
      </div>
    );
  }
  
  const isOwner = ipnft.owner?.wallet_address === walletAddress;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{ipnft.title}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">{ipnft.ip_type}</Badge>
            <Badge variant="outline">{ipnft.development_stage}</Badge>
            {ipnft.is_verified && (
              <Badge className="bg-green-500 text-white">Verified</Badge>
            )}
            {ipnft.is_fractionalized && (
              <Badge className="bg-blue-500 text-white">Fractionalized</Badge>
            )}
          </div>
        </div>
        
        {isOwner && (
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              onClick={() => setIsTransferDialogOpen(true)}
            >
              Transfer
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsListingDialogOpen(true)}
            >
              List for Sale
            </Button>
            {!ipnft.is_fractionalized && (
              <Button 
                variant="default" 
                onClick={() => setIsFractionDialogOpen(true)}
              >
                Fractionalize
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* Document Preview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {pdfUrl ? (
                <div className="border rounded-md overflow-hidden h-96">
                  <iframe 
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                </div>
              ) : (
                <div className="border rounded-md flex items-center justify-center h-96 bg-gray-50">
                  <p className="text-gray-500">No document available</p>
                </div>
              )}
            </CardContent>
            {pdfUrl && (
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(pdfUrl, '_blank')}
                >
                  View Full Document
                </Button>
              </CardFooter>
            )}
          </Card>
          
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Filing Date</p>
                  <p>{ipnft.filing_date ? formatDate(ipnft.filing_date) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiration Date</p>
                  <p>{ipnft.expiration_date ? formatDate(ipnft.expiration_date) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valuation</p>
                  <p>{ipnft.valuation ? `${ipnft.valuation} MATIC` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p>{formatDate(ipnft.created_at)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Authors</p>
                <p>{ipnft.authors?.join(', ') || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Institution</p>
                <p>{ipnft.institution || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Owner</p>
                <p>
                  {ipnft.owner?.name || truncateAddress(ipnft.owner?.wallet_address || '')}
                </p>
              </div>
              
              {ipnft.token_id && (
                <div>
                  <p className="text-sm text-gray-500">Token ID</p>
                  <p className="font-mono text-sm">{ipnft.token_id}</p>
                </div>
              )}
              
              {ipnft.contract_address && (
                <div>
                  <p className="text-sm text-gray-500">Contract Address</p>
                  <p className="font-mono text-sm">{truncateAddress(ipnft.contract_address)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          {/* Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{ipnft.description || 'No description provided.'}</p>
            </CardContent>
          </Card>
          
          {/* Tabs for History and Details */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history">Transaction History</TabsTrigger>
              <TabsTrigger value="details">Blockchain Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    Record of all transactions for this IP-NFT
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="border-b pb-4 last:border-0">
                          <div className="flex justify-between">
                            <div>
                              <Badge className="capitalize">
                                {tx.transaction_type}
                              </Badge>
                              <p className="mt-1 text-sm">
                                {formatDate(tx.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              {tx.amount > 0 && (
                                <p className="font-medium">
                                  {tx.amount} {tx.currency}
                                </p>
                              )}
                              <a 
                                href={`https://mumbai.polygonscan.com/tx/${tx.blockchain_tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                View on Explorer
                              </a>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm">
                            {tx.transaction_type === 'mint' && (
                              <p>
                                Minted by {tx.buyer?.name || truncateAddress(tx.buyer?.wallet_address || '')}
                              </p>
                            )}
                            
                            {tx.transaction_type === 'transfer' && (
                              <p>
                                From {tx.seller?.name || truncateAddress(tx.seller?.wallet_address || '')} to {tx.buyer?.name || truncateAddress(tx.buyer?.wallet_address || '')}
                              </p>
                            )}
                            
                            {tx.transaction_type === 'sale' && (
                              <p>
                                Sold by {tx.seller?.name || truncateAddress(tx.seller?.wallet_address || '')} to {tx.buyer?.name || truncateAddress(tx.buyer?.wallet_address || '')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500">
                      No transaction history available
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Blockchain Details</CardTitle>
                  <CardDescription>
                    Technical details about this IP-NFT
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ipnft.ipfs_metadata_uri && (
                    <div>
                      <p className="text-sm text-gray-500">Metadata URI</p>
                      <p className="font-mono text-sm break-all">
                        {ipnft.ipfs_metadata_uri}
                      </p>
                      <a 
                        href={`https://ipfs.io/ipfs/${ipnft.ipfs_metadata_uri.replace('ipfs://', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View Metadata
                      </a>
                    </div>
                  )}
                  
                  {ipnft.ipfs_document_cid && (
                    <div>
                      <p className="text-sm text-gray-500">Document CID</p>
                      <p className="font-mono text-sm break-all">
                        {ipnft.ipfs_document_cid}
                      </p>
                    </div>
                  )}
                  
                  {ipnft.contract_address && (
                    <div>
                      <p className="text-sm text-gray-500">Contract</p>
                      <p className="font-mono text-sm">
                        {ipnft.contract_address}
                      </p>
                      <a 
                        href={`https://mumbai.polygonscan.com/address/${ipnft.contract_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View on Explorer
                      </a>
                    </div>
                  )}
                  
                  {ipnft.token_id && (
                    <div>
                      <p className="text-sm text-gray-500">Token ID</p>
                      <p className="font-mono text-sm">
                        {ipnft.token_id}
                      </p>
                      {ipnft.contract_address && (
                        <a 
                          href={`https://mumbai.polygonscan.com/token/${ipnft.contract_address}?a=${ipnft.token_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Token
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Transfer Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer IP-NFT</DialogTitle>
            <DialogDescription>
              Enter the wallet address of the recipient to transfer this IP-NFT.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input 
                id="recipient" 
                placeholder="0x..." 
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsTransferDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleTransfer}
              disabled={!transferAddress || transferLoading}
            >
              {transferLoading ? 'Transferring...' : 'Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Listing Dialog */}
      <Dialog open={isListingDialogOpen} onOpenChange={setIsListingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>List IP-NFT for Sale</DialogTitle>
            <DialogDescription>
              Set a price to list this IP-NFT on the marketplace.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (MATIC)</Label>
              <Input 
                id="price" 
                type="number"
                placeholder="0.00" 
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsListingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateListing}
              disabled={!listingPrice || listingLoading}
            >
              {listingLoading ? 'Creating Listing...' : 'List for Sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Fractionalization Dialog */}
      <Dialog open={isFractionDialogOpen} onOpenChange={setIsFractionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fractionalize IP-NFT</DialogTitle>
            <DialogDescription>
              Convert your IP-NFT into tradable tokens.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p>
              Fractionalizing your IP-NFT will:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Create ERC-20 tokens representing ownership shares</li>
              <li>Allow partial ownership and trading of shares</li>
              <li>Lock the original NFT in a smart contract</li>
              <li>Incur a 3% platform fee based on valuation</li>
            </ul>
            <p className="mt-4">
              You'll be able to configure token details in the next step.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsFractionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleFractionalize}>
              Continue to Fractionalization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IPNFTDetail; 