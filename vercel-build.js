// vercel-build.js
// This script is used by Vercel to build the application with proper environment variables

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting Vercel build process...');

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
  console.log('✅ Created public directory');
}

// Create _redirects file
fs.writeFileSync('public/_redirects', '/* /index.html 200');
console.log('✅ Created _redirects file for proper routing');

// Create env-config.js file
const envConfigContent = `// This file is generated at build time to expose environment variables to the client
window.ENV = {
  VITE_CLERK_PUBLISHABLE_KEY: "${process.env.VITE_CLERK_PUBLISHABLE_KEY || ''}",
  VITE_BLOCKCHAIN_NETWORK: "${process.env.VITE_BLOCKCHAIN_NETWORK || ''}",
  VITE_IP_NFT_REGISTRY_CONTRACT: "${process.env.VITE_IP_NFT_REGISTRY_CONTRACT || ''}",
  VITE_SIMPLE_IP_NFT_REGISTRY_CONTRACT: "${process.env.VITE_SIMPLE_IP_NFT_REGISTRY_CONTRACT || ''}",
  VITE_POLYGON_AMOY_RPC_URL: "${process.env.VITE_POLYGON_AMOY_RPC_URL || ''}",
  VITE_CHAIN_ID: "${process.env.VITE_CHAIN_ID || ''}",
  VITE_NETWORK_NAME: "${process.env.VITE_NETWORK_NAME || ''}"
};`;

fs.writeFileSync('public/env-config.js', envConfigContent);
console.log('✅ Created env-config.js file with environment variables');

// Run the build command
try {
  console.log('🔨 Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');

  // Copy important files to the dist directory
  if (fs.existsSync('public/fallback.html')) {
    fs.copyFileSync('public/fallback.html', 'dist/fallback.html');
  }
  fs.copyFileSync('public/_redirects', 'dist/_redirects');
  fs.copyFileSync('public/env-config.js', 'dist/env-config.js');
  console.log('✅ Copied important files to the dist directory');

  console.log('🎉 Vercel build process completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
} 