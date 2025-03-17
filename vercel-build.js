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
  VITE_NETWORK_NAME: "${process.env.VITE_NETWORK_NAME || ''}",
  VITE_API_URL: "${process.env.VITE_API_URL || ''}",
  VITE_NFT_STORAGE_API_KEY: "${process.env.VITE_NFT_STORAGE_API_KEY || ''}",
  VITE_FRACTIONALIZATION_FACTORY_CONTRACT: "${process.env.VITE_FRACTIONALIZATION_FACTORY_CONTRACT || ''}"
};`;

fs.writeFileSync('public/env-config.js', envConfigContent);
console.log('✅ Created env-config.js file with environment variables');

// Create a fallback.html file
const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Veltis - Loading</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #f9fafb;
      color: #111827;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      padding: 0 20px;
      text-align: center;
    }
    .loader {
      border: 4px solid #f3f3f3;
      border-radius: 50%;
      border-top: 4px solid #3b82f6;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h1 {
      margin-bottom: 10px;
    }
    p {
      color: #6b7280;
      max-width: 500px;
    }
  </style>
</head>
<body>
  <div class="loader"></div>
  <h1>Loading Veltis Platform</h1>
  <p>Please wait while we load the application. If this takes too long, please refresh the page.</p>
  <script>
    // Redirect to home page after 5 seconds
    setTimeout(() => {
      window.location.href = '/';
    }, 5000);
  </script>
</body>
</html>`;

fs.writeFileSync('public/fallback.html', fallbackHtml);
console.log('✅ Created fallback.html file');

// Run the build command
try {
  console.log('🔨 Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');

  // Copy important files to the dist directory
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  fs.copyFileSync('public/fallback.html', 'dist/fallback.html');
  fs.copyFileSync('public/_redirects', 'dist/_redirects');
  fs.copyFileSync('public/env-config.js', 'dist/env-config.js');
  console.log('✅ Copied important files to the dist directory');

  console.log('🎉 Vercel build process completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
