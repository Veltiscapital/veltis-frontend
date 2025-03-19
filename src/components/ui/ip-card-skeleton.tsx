import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface IPCardSkeletonGridProps {
  count?: number;
}

export function IPCardSkeletonGrid({ count = 6 }: IPCardSkeletonGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse"></div>
            <div className="flex items-center mt-2">
              <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
              <div className="mx-2 h-3 w-1 bg-muted rounded animate-pulse"></div>
              <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="h-4 w-full bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
