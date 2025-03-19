import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated, connectWallet } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Tokenize and Fractionalize Biotech IP Assets
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-12">
            Veltis is a platform that allows biotech startups to tokenize their intellectual property
            and fractionalize ownership, creating an alternative liquidity source for R&D projects.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => connectWallet()}>
                  Connect Wallet
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/sign-in">Sign In</Link>
                </Button>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-primary"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Tokenize IP</h3>
              <p className="text-muted-foreground text-center">
                Convert your biotech intellectual property into NFTs with verifiable ownership and provenance.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-primary"
                >
                  <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34" />
                  <path d="M14 3v4a2 2 0 0 0 2 2h4" />
                  <path d="M16 16h6" />
                  <path d="M19 13v6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Fractionalize Ownership</h3>
              <p className="text-muted-foreground text-center">
                Split your IP-NFTs into fractional tokens that can be traded on secondary markets.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-primary"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Access Liquidity</h3>
              <p className="text-muted-foreground text-center">
                Create an alternative funding source for your biotech R&D projects through fractional ownership.
              </p>
            </div>
          </div>
          
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Revolutionizing Biotech Funding
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Veltis bridges the gap between traditional biotech funding and decentralized finance,
              enabling researchers and startups to access capital while allowing investors to
              participate in the biotech revolution with lower barriers to entry.
            </p>
            <Button size="lg" variant="outline" asChild>
              <Link to="/dashboard">Explore the Platform</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
