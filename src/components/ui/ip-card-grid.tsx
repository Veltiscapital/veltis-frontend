import React from 'react';
import IPCard from './ip-card';

interface IPNFT {
  id: string;
  name: string;
  ipType: string;
  valuation: string;
  developmentStage: string;
  verificationLevel?: 'Basic' | 'Institutional' | 'Expert Reviewed' | 'Unverified';
}

interface IPCardGridProps {
  ipnfts: IPNFT[];
  emptyMessage?: string;
}

export const IPCardGrid: React.FC<IPCardGridProps> = ({ 
  ipnfts, 
  emptyMessage = "No IP-NFTs found" 
}) => {
  if (!ipnfts || ipnfts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ipnfts.map((ipnft, index) => (
        <IPCard
          key={ipnft.id}
          id={ipnft.id}
          name={ipnft.name}
          type={ipnft.ipType}
          valuation={ipnft.valuation}
          stage={ipnft.developmentStage}
          verificationLevel={ipnft.verificationLevel}
        />
      ))}
    </div>
  );
};

export default IPCardGrid; 