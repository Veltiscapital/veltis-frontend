
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ExternalLink, ShoppingCart, Eye } from "lucide-react";
import * as blockchain from "@/lib/blockchain";
import { VERIFICATION_LEVELS } from "@/lib/config";

interface MarketplaceCardProps {
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
  onBuyClick: (id: string) => void;
  isFractional?: boolean;
}

export const MarketplaceCard = ({
  id,
  name,
  description,
  ipType,
  price,
  valuation,
  imageUrl,
  verificationLevel,
  tokenId,
  owner,
  onBuyClick,
  isFractional = false,
}: MarketplaceCardProps) => {
  // Find verification level details
  const verificationDetails = VERIFICATION_LEVELS.find(level => level.value === verificationLevel) 
    || VERIFICATION_LEVELS[0];
  
  return (
    <Card className="glass-card overflow-hidden rounded-xl flex flex-col h-full">
      <div className="h-40 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-center">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="text-2xl font-bold text-indigo-300">{ipType}</div>
        )}
      </div>
      
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-medium">{name}</h3>
            <p className="text-sm text-gray-500">{ipType}</p>
          </div>
          <Badge
            className={`bg-${verificationDetails.color}-100 text-${verificationDetails.color}-800`}
          >
            {verificationDetails.label}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="font-medium">${price}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Valuation</p>
            <p className="font-medium">${valuation}</p>
          </div>
          {isFractional && (
            <>
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-medium">Fractional</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Token</p>
                <p className="font-medium truncate">{tokenId?.substring(0, 8)}...</p>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="p-5 pt-0 border-t border-gray-100 mt-auto">
        <div className="flex justify-between items-center">
          <Link 
            to={blockchain.getAddressUrl(owner)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 text-xs flex items-center"
          >
            View seller <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/marketplace/${id}`}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Link>
            </Button>
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition-opacity"
              size="sm"
              onClick={() => onBuyClick(id)}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Buy
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
