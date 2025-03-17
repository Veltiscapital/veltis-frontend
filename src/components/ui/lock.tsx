
import React from 'react';
import { Lock as LockIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from './card';
import { Button } from './button';

interface LockProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Lock({ 
  title = "Authentication Required", 
  description = "You need to connect your wallet to access this content", 
  children 
}: LockProps) {
  const { isAuthenticated, connectWallet } = useAuth();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full min-h-[200px]">
      <div className="absolute inset-0 backdrop-blur-sm bg-white/50 flex items-center justify-center z-10">
        <Card className="max-w-md w-full p-6 text-center shadow-lg border-none bg-white/80">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockIcon className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{description}</p>
          <Button
            onClick={connectWallet}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            Connect Wallet
          </Button>
        </Card>
      </div>
      <div className="opacity-20 pointer-events-none">
        {children}
      </div>
    </div>
  );
}
