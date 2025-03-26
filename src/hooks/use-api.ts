import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Define common types
export interface User {
  id: string;
  name: string;
  email: string;
  walletAddress?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Custom hook for API calls
export function useApi<T>(endpoint: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // For demo purposes, we'll simulate API calls with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate mock data based on the endpoint
        let mockData: any;

        if (endpoint === '/api/user') {
          mockData = {
            id: '1',
            name: 'Demo User',
            email: 'demo@example.com',
            walletAddress: '0x1234567890123456789012345678901234567890'
          };
        } else {
          // Default mock data
          mockData = { message: 'Mock API response' };
        }

        setData(mockData as T);
      } catch (err) {
        console.error('API error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    } else {
      setData(null);
      setIsLoading(false);
    }
  }, [endpoint, isAuthenticated]);

  return { data, isLoading, error };
}

// Specialized hook for IP-NFTs
export function useIPNFTs<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, walletAddress } = useAuth();

  useEffect(() => {
    const fetchIPNFTs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate mock IP-NFTs data
        const mockIPNFTs = [
          {
            id: '1',
            name: 'Cancer Treatment Patent',
            description: 'Novel approach to targeted cancer therapy using modified T-cells',
            status: 'active',
            valuation: '2500000',
            expiry: '2040-05-15',
            protection: 'Patent',
            stage: 'Clinical Trials',
            owner: walletAddress || '0x1234567890123456789012345678901234567890',
            tokenId: '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            verificationLevel: 'Expert Reviewed',
            ipType: 'Patent',
            developmentStage: 'Clinical Trials'
          },
          {
            id: '2',
            name: 'Alzheimer\'s Diagnostic Tool',
            description: 'Early-stage diagnostic tool for Alzheimer\'s disease using blood biomarkers',
            status: 'active',
            valuation: '1800000',
            expiry: '2042-08-22',
            protection: 'Patent',
            stage: 'Discovery',
            owner: walletAddress || '0x1234567890123456789012345678901234567890',
            tokenId: '2',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            verificationLevel: 'Institutional',
            ipType: 'Patent',
            developmentStage: 'Discovery'
          },
          {
            id: '3',
            name: 'Diabetes Management Platform',
            description: 'AI-powered platform for personalized diabetes management and treatment optimization',
            status: 'active',
            valuation: '3200000',
            expiry: '2039-11-30',
            protection: 'Patent',
            stage: 'Development',
            owner: walletAddress || '0x1234567890123456789012345678901234567890',
            tokenId: '3',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            verificationLevel: 'Basic',
            ipType: 'Software',
            developmentStage: 'Development'
          }
        ];

        setData(mockIPNFTs as unknown as T);
      } catch (err) {
        console.error('Error fetching IP-NFTs:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch IP-NFTs');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchIPNFTs();
    } else {
      setData(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, walletAddress]);

  return { data, isLoading, error };
}
