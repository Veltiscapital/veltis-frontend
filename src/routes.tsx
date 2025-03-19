import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { createBrowserRouter } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import MyIPNFTs from './pages/MyIPNFTs';
import IPNFTDetail from './pages/IPNFTDetail';
import MintIPNFT from './pages/MintIPNFT';
import Fractionalize from './pages/Fractionalize';
import FractionDetail from './pages/FractionDetail';
import Vault from './pages/Vault';
import Analytics from './pages/Analytics';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import NotFound from './pages/NotFound';
import IPNFTs from './pages/IPNFTs';
import Consulting from './pages/Consulting';
import OneStepFractionalize from './pages/OneStepFractionalize';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
};

// Routes configuration
const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'sign-in', element: <SignIn /> },
      { path: 'sign-up', element: <SignUp /> },
      { 
        path: 'dashboard', 
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'marketplace', element: <Marketplace /> },
          { path: 'my-ipnfts', element: <MyIPNFTs /> },
          { path: 'ipnfts', element: <IPNFTs /> },
          { path: 'ipnfts/:id', element: <IPNFTDetail /> },
          { path: 'mint', element: <MintIPNFT /> },
          { path: 'fractionalize', element: <Fractionalize /> },
          { path: 'fractionalize/:id', element: <Fractionalize /> },
          { path: 'one-step-fractionalize', element: <OneStepFractionalize /> },
          { path: 'fractions/:address', element: <FractionDetail /> },
          { path: 'vault', element: <Vault /> },
          { path: 'analytics', element: <Analytics /> },
          { path: 'consulting', element: <Consulting /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export default routes;
