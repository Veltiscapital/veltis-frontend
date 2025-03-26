// setup-local-env.js
// This script generates the env-config.js file with values from .env.local for local development

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envVars = dotenv.config({ path: envPath }).parsed || {};

console.log('🚀 Setting up local environment...');

// Create public directory if it doesn't exist
const publicDir = path.resolve(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✅ Created public directory');
}

// Create env-config.js file with actual values from .env.local
const envConfigContent = `// This file is generated for local development to expose environment variables to the client
window.ENV = {
  VITE_CLERK_PUBLISHABLE_KEY: "${envVars.VITE_CLERK_PUBLISHABLE_KEY || ''}",
  VITE_BLOCKCHAIN_NETWORK: "${envVars.VITE_BLOCKCHAIN_NETWORK || ''}",
  VITE_IP_NFT_REGISTRY_CONTRACT: "${envVars.VITE_IP_NFT_REGISTRY_CONTRACT || ''}",
  VITE_IPNFT_CONTRACT: "${envVars.VITE_IPNFT_CONTRACT || ''}",
  VITE_SIMPLE_IP_NFT_REGISTRY_CONTRACT: "${envVars.VITE_SIMPLE_IP_NFT_REGISTRY_CONTRACT || ''}",
  VITE_POLYGON_AMOY_RPC_URL: "${envVars.VITE_POLYGON_AMOY_RPC_URL || ''}",
  VITE_POLYGON_MAINNET_RPC_URL: "${envVars.VITE_POLYGON_MAINNET_RPC_URL || ''}",
  VITE_CHAIN_ID: "${envVars.VITE_CHAIN_ID || ''}",
  VITE_NETWORK_NAME: "${envVars.VITE_NETWORK_NAME || ''}",
  VITE_RPC_URL: "${envVars.VITE_RPC_URL || ''}",
  VITE_NFT_STORAGE_API_KEY: "${envVars.VITE_NFT_STORAGE_API_KEY || ''}",
  VITE_FRACTIONALIZATION_FACTORY: "${envVars.VITE_FRACTIONALIZATION_FACTORY || ''}",
  VITE_ONE_STEP_FRACTIONALIZATION: "${envVars.VITE_ONE_STEP_FRACTIONALIZATION || ''}",
  VITE_API_URL: "${envVars.VITE_API_URL || ''}",
  VITE_INFURA_ID: "${envVars.VITE_INFURA_ID || ''}"
};`;

fs.writeFileSync(path.resolve(publicDir, 'env-config.js'), envConfigContent);
console.log('✅ Created env-config.js file with environment variables from .env.local');

console.log('🎉 Local environment setup completed successfully!');
