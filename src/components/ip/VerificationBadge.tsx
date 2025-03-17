
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, AlertCircle, Shield, Building } from "lucide-react";
import { VERIFICATION_LEVELS } from '@/lib/config';

interface VerificationBadgeProps {
  level: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VerificationBadge = ({ 
  level, 
  showLabel = true,
  size = 'md'
}: VerificationBadgeProps) => {
  // Find verification level from config
  const verificationLevel = VERIFICATION_LEVELS.find(vl => vl.value === level) || VERIFICATION_LEVELS[0];
  
  // Map icon based on verification level
  const getIcon = () => {
    switch (level) {
      case 'institutional':
        return <Building className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />;
      case 'expert':
        return <Shield className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />;
      case 'basic':
        return <CheckCircle className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />;
      case 'unverified':
      default:
        return <AlertCircle className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />;
    }
  };
  
  // Map color based on verification level
  const getColorClasses = () => {
    switch (verificationLevel.color) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'gray':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${getColorClasses()} flex items-center gap-1 px-2 py-1 font-normal`}
          >
            {getIcon()}
            {showLabel && verificationLevel.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">
            {level === 'unverified' 
              ? 'This IP has not been verified yet' 
              : `${verificationLevel.label}: This IP has been verified by ${level === 'institutional' ? 'a trusted institution' : level === 'expert' ? 'domain experts' : 'the platform'}`
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
