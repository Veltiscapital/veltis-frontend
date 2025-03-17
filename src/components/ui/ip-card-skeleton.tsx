import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const IPCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <Skeleton className="h-40 w-full" />
      
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-20" />
        </div>
        
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
          
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
          
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>
      
      <div className="p-5 pt-0 mt-auto">
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
};

export const IPCardSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(count).fill(0).map((_, index) => (
        <IPCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default IPCardSkeletonGrid;
