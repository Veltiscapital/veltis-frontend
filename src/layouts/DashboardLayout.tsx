import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <aside className="bg-gray-50 border-r w-64 fixed h-full p-4 hidden md:block">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Welcome, {user?.name || 'User'}</p>
        </div>
        
        <nav className="space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
          >
            Overview
          </Link>
          <Link
            to="/dashboard/ipnfts"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
          >
            IP-NFTs
          </Link>
          <Link
            to="/dashboard/my-ipnfts"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
          >
            My IP-NFTs
          </Link>
          <Link
            to="/dashboard/mint"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
          >
            Mint IP-NFT
          </Link>
          <Link
            to="/dashboard/fractionalize"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
          >
            Fractionalize
          </Link>
          <Link
            to="/dashboard/marketplace"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
          >
            Marketplace
          </Link>
          <Link
            to="/dashboard/vault"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
          >
            Vault
          </Link>
          <Link
            to="/dashboard/analytics"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
          >
            Analytics
          </Link>
          <Link
            to="/dashboard/consulting"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
          >
            Consulting
          </Link>
        </nav>
      </aside>
      
      <div className="md:pl-64 flex-1">
        <div className="container mx-auto px-6 py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
