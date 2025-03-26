import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Info, Layers, DollarSign, Users, TrendingUp } from 'lucide-react';
import { formatAddress } from '@/lib/blockchain';

interface FractionalTokenCardProps {
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
  onClick?: () => void;
}

const FractionalTokenCard: React.FC<FractionalTokenCardProps> = ({
  id,
  name,
  symbol,
  description,
  imageUrl,
  price,
  totalShares,
  availableShares,
  ipnftId,
  ipnftContract,
  fractionAddress,
  owner,
  onClick,
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/fractions/${fractionAddress}`);
    }
  };
  
  const percentAvailable = (Number(availableShares) / Number(totalShares)) * 100;
  
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="truncate">{name}</CardTitle>
            <CardDescription>
              <Badge variant="outline" className="mr-2">
                {symbol}
              </Badge>
              <Badge variant="secondary">Fractional</Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {description}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Price</p>
              <p className="text-sm text-muted-foreground">{price} MATIC</p>
            </div>
          </div>
          <div className="flex items-center">
            <Layers className="h-4 w-4 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Available</p>
              <p className="text-sm text-muted-foreground">
                {availableShares} / {totalShares}
              </p>
            </div>
          </div>
        </div>
        
        {/* Progress bar for available shares */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-primary h-2 rounded-full"
            style={{ width: `${percentAvailable}%` }}
          ></div>
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground">
          <Users className="h-3 w-3 mr-1" />
          <span>Owner: {formatAddress(owner)}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button onClick={handleClick} className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FractionalTokenCard; 