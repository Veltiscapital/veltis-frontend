import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import OneStepFractionalizationForm from '@/components/fractionalization/OneStepFractionalizationForm';

const OneStepFractionalize = () => {
  const navigate = useNavigate();
  const { walletAddress, isAuthenticated, connectWallet } = useAuth();
  
  // Handle fractionalization success
  const handleFractionalizationSuccess = (data: { fractionalizationContract: string, tokenId: string }) => {
    toast.success('IP-NFT successfully created and fractionalized!');
    // Navigate to the fractionalization details page
    navigate(`/dashboard/fractions/${data.fractionalizationContract}`);
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/dashboard');
  };
  
  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected successfully');
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };
  
  // Render authentication required
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please sign in to create and fractionalize your IP-NFT.</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Sign In Required</AlertTitle>
                <AlertDescription>
                  You need to sign in to access this feature.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/sign-in')}>Sign In</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  // Render wallet connection required
  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Wallet Connection Required</CardTitle>
              <CardDescription>Please connect your wallet to create and fractionalize your IP-NFT.</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Connect Wallet</AlertTitle>
                <AlertDescription>
                  You need to connect your wallet to access this feature.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button onClick={handleConnectWallet}>Connect Wallet</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create & Fractionalize IP-NFT</h1>
          <p className="text-muted-foreground mt-2">
            Create a new IP-NFT and fractionalize it in a single transaction for streamlined ownership distribution.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>One-Step Fractionalization</CardTitle>
            <CardDescription>
              Complete the form below to create a new IP-NFT and instantly fractionalize it into tradable tokens.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OneStepFractionalizationForm 
              onSuccess={handleFractionalizationSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OneStepFractionalize; 