import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import Web3Provider from './components/Web3Provider';
import { Toaster } from 'sonner';
import './index.css';

// Log environment information for debugging
console.log('Environment:', import.meta.env.MODE);
console.log('Blockchain Network:', import.meta.env.VITE_BLOCKCHAIN_NETWORK);
console.log('Chain ID:', import.meta.env.VITE_CHAIN_ID);
console.log('Network Name:', import.meta.env.VITE_NETWORK_NAME);
console.log('IPNFT Registry Address:', import.meta.env.VITE_IP_NFT_REGISTRY_CONTRACT);
console.log('Rule Engine Address:', import.meta.env.VITE_VELTIS_RULE_ENGINE);

// Debug logging
console.log('React initializing at', new Date().toISOString());
console.log('Render application with Web3Provider');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Web3Provider>
        <AuthProvider>
          <App />
          <Toaster position="top-right" />
        </AuthProvider>
      </Web3Provider>
    </BrowserRouter>
  </React.StrictMode>
);
