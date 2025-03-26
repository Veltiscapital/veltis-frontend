import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from './Navbar';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not loading and not authenticated, redirect to home
    if (!isLoading && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-veltis-blue" />
            <p className="mt-4 text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 pt-16">
          {children}
        </div>
      </div>
    );
  }

  // This should not be visible due to the redirect in useEffect
  return null;
};
