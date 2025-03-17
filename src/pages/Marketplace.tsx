import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IPCardSkeletonGrid } from "@/components/ui/ip-card-skeleton";
import { VERIFICATION_LEVELS, IP_TYPES } from "@/lib/config";
import { MarketplaceCard } from "@/components/marketplace/MarketplaceCard";
import FractionalTokenCard from "@/components/marketplace/FractionalTokenCard";
import { toast } from "sonner";
import * as blockchain from "@/lib/blockchain";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Loader2,
  ShoppingBag,
  Tag,
  X,
  AlertCircle
} from "lucide-react";

interface MarketplaceListing {
  id: string;
  name: string;
  description: string;
  ipType: string;
  price: string;
  valuation: string;
  imageUrl?: string;
  verificationLevel: string;
  tokenId?: string;
  owner: string;
  isFractional?: boolean;
}

interface FractionalListing {
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
}

const Marketplace = () => {
  const navigate = useNavigate();
  const { isAuthenticated, connectWallet } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    ipType: "",
    priceRange: "",
    verificationLevel: "",
    assetType: "all", // "all", "ipnft", "fractional"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [buyAmount, setBuyAmount] = useState("1");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch marketplace listings
  const { data: listingsData, isLoading, error, refetch } = useQuery({
    queryKey: ["marketplace-listings"],
    queryFn: async () => {
      const response = await api.marketplace.getListings();
      return response.data;
    },
    enabled: true,
  });

  // Fetch fractional listings
  const { data: fractionalData, isLoading: isFractionalLoading } = useQuery({
    queryKey: ["fractional-listings"],
    queryFn: async () => {
      const response = await api.fractionalization.getListings();
      return response.data;
    },
    enabled: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };

  const handleBuyClick = (listing: MarketplaceListing | FractionalListing) => {
    if (!isAuthenticated) {
      toast.error("Please connect your wallet to buy assets");
      return;
    }

    setSelectedListing(listing as MarketplaceListing);
    setShowBuyDialog(true);
  };

  const handleBuy = async () => {
    if (!selectedListing) return;

    try {
      setIsProcessing(true);

      if (selectedListing.isFractional) {
        // Buy fractional tokens
        const fractionListing = selectedListing as unknown as FractionalListing;
        const result = await blockchain.buyFractionShares(
          fractionListing.fractionAddress,
          buyAmount,
          fractionListing.price
        );

        toast.success(`Successfully purchased ${buyAmount} ${fractionListing.symbol} tokens!`);
      } else {
        // Buy IP-NFT
        // Implement IP-NFT purchase logic
        toast.success(`Successfully purchased ${selectedListing.name}!`);
      }

      setShowBuyDialog(false);
      refetch();
    } catch (error) {
      console.error("Error buying asset:", error);
      toast.error("Failed to complete purchase. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFilters = () => {
    setSelectedFilters({
      ipType: "",
      priceRange: "",
      verificationLevel: "",
      assetType: "all",
    });
    setShowFilters(false);
  };

  const applyFilters = () => {
    // Implement filter logic
    setShowFilters(false);
  };

  // Filter listings based on selected filters and search term
  const filteredListings = listingsData?.data?.filter((listing: MarketplaceListing) => {
    // Filter by asset type
    if (selectedFilters.assetType === "fractional" && !listing.isFractional) {
      return false;
    }
    if (selectedFilters.assetType === "ipnft" && listing.isFractional) {
      return false;
    }

    // Filter by search term
    if (
      searchTerm &&
      !listing.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !listing.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Filter by IP type
    if (selectedFilters.ipType && listing.ipType !== selectedFilters.ipType) {
      return false;
    }

    // Filter by verification level
    if (
      selectedFilters.verificationLevel &&
      listing.verificationLevel !== selectedFilters.verificationLevel
    ) {
      return false;
    }

    // Filter by price range
    if (selectedFilters.priceRange) {
      const price = parseFloat(listing.price);
      const [min, max] = selectedFilters.priceRange.split("-").map(Number);
      if (price < min || (max && price > max)) {
        return false;
      }
    }

    return true;
  }) || [];

  // Filter fractional listings
  const filteredFractionalListings = fractionalData?.data?.filter((listing: FractionalListing) => {
    // Filter by asset type
    if (selectedFilters.assetType === "ipnft") {
      return false;
    }

    // Filter by search term
    if (
      searchTerm &&
      !listing.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !listing.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Filter by price range
    if (selectedFilters.priceRange) {
      const price = parseFloat(listing.price);
      const [min, max] = selectedFilters.priceRange.split("-").map(Number);
      if (price < min || (max && price > max)) {
        return false;
      }
    }

    return true;
  }) || [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Discover and trade IP assets and fractional tokens
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => navigate("/mint")} className="flex items-center">
            <Tag className="mr-2 h-4 w-4" />
            Mint New IP-NFT
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, description, or IP type..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>
        <Button
          variant="outline"
          className="flex items-center"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <Card className="mb-8 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Asset Type</label>
              <Select
                value={selectedFilters.assetType}
                onValueChange={(value) =>
                  setSelectedFilters({ ...selectedFilters, assetType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Assets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  <SelectItem value="ipnft">IP-NFTs Only</SelectItem>
                  <SelectItem value="fractional">Fractional Tokens Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">IP Type</label>
              <Select
                value={selectedFilters.ipType}
                onValueChange={(value) =>
                  setSelectedFilters({ ...selectedFilters, ipType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All IP Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All IP Types</SelectItem>
                  {IP_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Price Range</label>
              <Select
                value={selectedFilters.priceRange}
                onValueChange={(value) =>
                  setSelectedFilters({ ...selectedFilters, priceRange: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Price</SelectItem>
                  <SelectItem value="0-1">0 - 1 MATIC</SelectItem>
                  <SelectItem value="1-10">1 - 10 MATIC</SelectItem>
                  <SelectItem value="10-100">10 - 100 MATIC</SelectItem>
                  <SelectItem value="100-1000">100 - 1000 MATIC</SelectItem>
                  <SelectItem value="1000">1000+ MATIC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Verification Level</label>
              <Select
                value={selectedFilters.verificationLevel}
                onValueChange={(value) =>
                  setSelectedFilters({ ...selectedFilters, verificationLevel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Verification</SelectItem>
                  {VERIFICATION_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </div>
        </Card>
      )}

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Assets</TabsTrigger>
          <TabsTrigger value="ipnfts">IP-NFTs</TabsTrigger>
          <TabsTrigger value="fractional">Fractional Tokens</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {isLoading || isFractionalLoading ? (
            <IPCardSkeletonGrid count={6} />
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load marketplace listings. Please try again.
              </AlertDescription>
            </Alert>
          ) : filteredListings.length === 0 && filteredFractionalListings.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No listings found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderListings([...filteredListings, ...filteredFractionalListings])}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ipnfts">
          {isLoading ? (
            <IPCardSkeletonGrid count={6} />
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load IP-NFT listings. Please try again.
              </AlertDescription>
            </Alert>
          ) : filteredListings.filter(listing => !listing.isFractional).length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No IP-NFT listings found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderListings(filteredListings.filter(listing => !listing.isFractional))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="fractional">
          {isFractionalLoading ? (
            <IPCardSkeletonGrid count={6} />
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load fractional token listings. Please try again.
              </AlertDescription>
            </Alert>
          ) : filteredFractionalListings.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No fractional token listings found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderFractionalListings(filteredFractionalListings)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy {selectedListing?.name}</DialogTitle>
            <DialogDescription>
              {selectedListing?.isFractional
                ? "Purchase fractional tokens of this IP asset"
                : "Purchase this IP-NFT"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between">
              <span className="font-medium">Price:</span>
              <span>{selectedListing?.price} MATIC</span>
            </div>
            
            {selectedListing?.isFractional && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount to buy:</label>
                <Input
                  type="number"
                  min="1"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                />
                <div className="flex justify-between text-sm">
                  <span>Total cost:</span>
                  <span>
                    {(parseFloat(selectedListing?.price || "0") * parseFloat(buyAmount || "0")).toFixed(6)} MATIC
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBuy} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Purchase"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderListings(items: any[]) {
    return items.map((item) => {
      if (item.isFractional || item.fractionAddress) {
        return (
          <FractionalTokenCard
            key={item.id}
            id={item.id}
            name={item.name}
            symbol={item.symbol || "FRAC"}
            description={item.description}
            imageUrl={item.imageUrl}
            price={item.price}
            totalShares={item.totalShares}
            availableShares={item.availableShares}
            ipnftId={item.ipnftId}
            ipnftContract={item.ipnftContract}
            fractionAddress={item.fractionAddress}
            owner={item.owner}
            onClick={() => handleBuyClick(item)}
          />
        );
      } else {
        return (
          <MarketplaceCard
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description}
            ipType={item.ipType}
            price={item.price}
            imageUrl={item.imageUrl}
            verificationLevel={item.verificationLevel}
            onClick={() => handleBuyClick(item)}
          />
        );
      }
    });
  }

  function renderFractionalListings(items: FractionalListing[]) {
    return items.map((item) => (
      <FractionalTokenCard
        key={item.id}
        id={item.id}
        name={item.name}
        symbol={item.symbol}
        description={item.description}
        imageUrl={item.imageUrl}
        price={item.price}
        totalShares={item.totalShares}
        availableShares={item.availableShares}
        ipnftId={item.ipnftId}
        ipnftContract={item.ipnftContract}
        fractionAddress={item.fractionAddress}
        owner={item.owner}
        onClick={() => handleBuyClick(item)}
      />
    ));
  }

  function formatPriceRange(range: string) {
    if (!range) return "Any Price";
    
    const [min, max] = range.split("-").map(Number);
    if (!max) return `${min}+ MATIC`;
    return `${min} - ${max} MATIC`;
  }

  function formatNumber(value: string | number) {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat().format(num);
  }
};

export default Marketplace;
