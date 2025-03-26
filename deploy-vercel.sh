#!/bin/bash

# Veltis Frontend Vercel Deployment Script
# This script focuses on deploying to Vercel with proper configuration

echo "🚀 Starting Veltis Frontend Vercel Deployment Process"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
  echo "⚠️ .env.production file not found. Creating one..."
  touch .env.production
  
  # Add required environment variables
  echo "VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZmFpci10YWhyLTM1LmNsZXJrLmFjY291bnRzLmRldiQ" >> .env.production
  echo "VITE_NFT_STORAGE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEZFMTI3RDI3MzlhNzJCNDM3RjM3N2M1ODFjMTI5NjY4QjcwMDRFMzAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY5MzQyMDI5MzI3MCwibmFtZSI6IlZlbHRpcyJ9.Nh7D7oRPHEWmA9jKrULG0d7DQZnXYi_bBwQpKQkXNwA" >> .env.production
  echo "VITE_BLOCKCHAIN_NETWORK=polygon-amoy" >> .env.production
  echo "VITE_IP_NFT_REGISTRY_CONTRACT=0x123456789abcdef123456789abcdef123456789a" >> .env.production
  echo "VITE_SIMPLE_IP_NFT_REGISTRY_CONTRACT=0x123456789abcdef123456789abcdef123456789a" >> .env.production
  echo "VITE_FRACTIONALIZATION_FACTORY_CONTRACT=0x123456789abcdef123456789abcdef123456789a" >> .env.production
  echo "VITE_POLYGON_AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/demo" >> .env.production
  echo "VITE_CHAIN_ID=80002" >> .env.production
  echo "VITE_NETWORK_NAME=Polygon Amoy Testnet" >> .env.production
  
  echo "✅ Created .env.production with default values"
  echo "⚠️ Please update these values with your actual API keys and contract addresses"
fi

# Ensure public directory exists
if [ ! -d "public" ]; then
  mkdir -p public
  echo "✅ Created public directory"
fi

# Ensure _redirects file exists
echo "/* /index.html 200" > public/_redirects
echo "✅ Created/Updated _redirects file for proper routing"

# Create env-config.js if it doesn't exist
if [ ! -f "public/env-config.js" ]; then
  cat > public/env-config.js << 'EOL'
// This file is generated at build time to expose environment variables to the client
window.ENV = {
  VITE_CLERK_PUBLISHABLE_KEY: "${VITE_CLERK_PUBLISHABLE_KEY}",
  VITE_BLOCKCHAIN_NETWORK: "${VITE_BLOCKCHAIN_NETWORK}",
  VITE_IP_NFT_REGISTRY_CONTRACT: "${VITE_IP_NFT_REGISTRY_CONTRACT}",
  VITE_SIMPLE_IP_NFT_REGISTRY_CONTRACT: "${VITE_SIMPLE_IP_NFT_REGISTRY_CONTRACT}",
  VITE_POLYGON_AMOY_RPC_URL: "${VITE_POLYGON_AMOY_RPC_URL}",
  VITE_CHAIN_ID: "${VITE_CHAIN_ID}",
  VITE_NETWORK_NAME: "${VITE_NETWORK_NAME}"
};
EOL
  echo "✅ Created env-config.js file"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "❌ Error: Failed to install dependencies"
  exit 1
fi
echo "✅ Dependencies installed successfully"

# Build the application
echo "🔨 Building the application..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Error: Build failed"
  exit 1
fi
echo "✅ Build completed successfully"

# Copy important files to the dist directory
cp public/fallback.html dist/
cp public/_redirects dist/
cp public/env-config.js dist/
echo "✅ Copied important files to the dist directory"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "⚠️ Vercel CLI not found. Installing..."
  npm install -g vercel
  if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install Vercel CLI"
    exit 1
  fi
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "Deploying to production..."
vercel --prod

if [ $? -ne 0 ]; then
  echo "❌ Error: Deployment failed"
  exit 1
fi

echo "✅ Deployment completed successfully"
echo "🎉 Veltis Frontend has been deployed to Vercel!"
echo ""
echo "If you still see a blank page, try the following:"
echo "1. Clear your browser cache completely"
echo "2. Try opening the site in an incognito/private window"
echo "3. Check browser console for specific errors"
echo "4. Verify that all environment variables are set correctly in Vercel"
echo ""
echo "Your site should be available at your Vercel deployment URL" 