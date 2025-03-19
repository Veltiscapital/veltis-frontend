import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface IPNFT {
  id: string;
  name: string;
  description?: string;
  status?: string;
  valuation?: string;
  ipType?: string;
  developmentStage?: string;
  verificationLevel?: string;
}

interface IPCardGridProps {
  ipnfts: IPNFT[];
}

export function IPCardGrid({ ipnfts }: IPCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ipnfts.map((ipnft) => (
        <Card key={ipnft.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{ipnft.name}</CardTitle>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="mr-2">{ipnft.ipType || 'Patent'}</span>
              <span className="mr-2">•</span>
              <span>{ipnft.developmentStage || 'Discovery'}</span>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {ipnft.description || 'No description available'}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm">
              <span className="font-medium">Valuation:</span>{' '}
              <span>${ipnft.valuation || '0'}</span>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to={`/dashboard/ipnfts/${ipnft.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
