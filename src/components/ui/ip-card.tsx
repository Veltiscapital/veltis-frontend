import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface IPCardProps {
  id: string;
  name: string;
  type: string;
  valuation: string;
  stage: string;
  verificationLevel?: 'Basic' | 'Institutional' | 'Expert Reviewed' | 'Unverified';
  backgroundClass?: string;
}

const getVerificationColor = (level?: string) => {
  switch (level) {
    case 'Expert Reviewed':
      return 'bg-purple-100 text-purple-800';
    case 'Institutional':
      return 'bg-blue-100 text-blue-800';
    case 'Basic':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getBackgroundClass = (index: number) => {
  const backgrounds = [
    'bg-pink-50', // Light pink
    'bg-blue-50', // Light blue
    'bg-green-50', // Light green
    'bg-purple-50', // Light purple
    'bg-yellow-50', // Light yellow
  ];
  return backgrounds[index % backgrounds.length];
};

export const IPCard: React.FC<IPCardProps> = ({
  id,
  name,
  type,
  valuation,
  stage,
  verificationLevel = 'Unverified',
  backgroundClass,
}) => {
  const bgClass = backgroundClass || getBackgroundClass(Math.floor(Math.random() * 5));
  const verificationColor = getVerificationColor(verificationLevel);

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className={`h-40 ${bgClass} flex items-center justify-center`}>
        <div className="text-2xl font-bold text-gray-400 opacity-20">{type}</div>
      </div>
      
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{name}</h3>
          <Badge className={verificationColor}>
            {verificationLevel}
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-medium">{type}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Valuation</p>
            <p className="font-medium">${valuation}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Stage</p>
            <p className="font-medium">{stage}</p>
          </div>
        </div>
      </div>
      
      <div className="p-5 pt-0 mt-auto">
        <Button 
          variant="outline" 
          className="w-full justify-between"
          asChild
        >
          <Link to={`/dashboard/ipnft/${id}`}>
            View Details
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};

export default IPCard; 