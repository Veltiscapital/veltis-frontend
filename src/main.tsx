import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider } from './contexts/AuthContext';
import { checkRequiredEnv } from './utils/env';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Get Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZmFpci10YWhyLTM1LmNsZXJrLmFjY291bnRzLmRldiQ';

// Check for required environment variables
const requiredEnvVars = [
  'VITE_CLERK_PUBLISHABLE_KEY',
  'VITE_BLOCKCHAIN_NETWORK',
  'VITE_IP_NFT_REGISTRY_CONTRACT',
  'VITE_SIMPLE_IP_NFT_REGISTRY_CONTRACT',
  'VITE_POLYGON_AMOY_RPC_URL',
  'VITE_CHAIN_ID',
  'VITE_NETWORK_NAME'
];

const envCheck = checkRequiredEnv(requiredEnvVars);
if (!envCheck.success) {
  console.warn('⚠️ Missing required environment variables:', envCheck.missing);
  // Continue anyway, but log a warning
}

// Enhanced error handler for production debugging
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null, errorInfo: React.ErrorInfo | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ color: '#e11d48' }}>Something went wrong</h1>
          <p>The application encountered an error. Please try refreshing the page.</p>
          <details style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <summary>Error Details</summary>
            <p style={{ color: '#e11d48', fontFamily: 'monospace' }}>{this.state.error?.toString()}</p>
            <pre style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f1f5f9', overflow: 'auto' }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '20px', 
              padding: '8px 16px', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ClerkProvider publishableKey={clerkPubKey}>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider defaultTheme="light" storageKey="veltis-theme">
                <App />
                <Toaster position="top-right" />
              </ThemeProvider>
            </QueryClientProvider>
          </AuthProvider>
        </ClerkProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
