import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/ui/navbar';

interface MainLayoutProps {
  requireAuth?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ requireAuth = false }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4">
          <Navbar />
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Veltis. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
