import { Outlet, Link, useLocation } from 'react-router-dom';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { FileText, BarChart3, ShoppingBag, Home, Split } from 'lucide-react';

export default function MainLayout() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Don't show header on sign-in and sign-up pages
  const isAuthPage = location.pathname === '/sign-in' || location.pathname === '/sign-up';
  
  if (isAuthPage) {
    return <Outlet />;
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-xl">Veltis</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                  location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                      location.pathname.startsWith('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/dashboard/marketplace" 
                    className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                      location.pathname.includes('/marketplace') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Marketplace
                  </Link>
                  <Link 
                    to="/dashboard/my-ipnfts" 
                    className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                      location.pathname.includes('/my-ipnfts') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    My IP-NFTs
                  </Link>
                  <Link 
                    to="/dashboard/fractionalize" 
                    className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                      location.pathname.includes('/fractionalize') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <Split className="h-4 w-4" />
                    Fractionalize
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <WalletConnect />
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="outline">Sign In</Button>
                </SignInButton>
                <Button asChild>
                  <Link to="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Veltis. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 