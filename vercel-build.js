// vercel-build.js
import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Starting Vercel build process...');

// Ensure we're using the right Node.js version
console.log('Node version:', process.version);

// Create .env file if it doesn't exist
if (!fs.existsSync('.env')) {
  console.log('Creating .env file...');
  
  const envContent = `# API Configuration
VITE_API_BASE_URL=https://veltis-backend.vercel.app/api

# Blockchain Configuration
VITE_BLOCKCHAIN_NETWORK=polygon-amoy
VITE_IP_NFT_REGISTRY_CONTRACT=0x0C0cE3CA0d5d21E2f58a7505Afc7856a36fd1363
VITE_SIMPLE_IP_NFT_REGISTRY_CONTRACT=0x0C0cE3CA0d5d21E2f58a7505Afc7856a36fd1363
VITE_FRACTIONALIZATION_FACTORY_CONTRACT=0xabcdef123456789abcdef123456789abcdef1234
VITE_MARKETPLACE_CONTRACT=0x456789abcdef123456789abcdef123456789abcde
VITE_POLYGON_AMOY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/mJNGWubj_qQYGnXn1mFLcHhiyBftWps7

# Feature Flags
VITE_KYC_REQUIRED=false
VITE_MARKETPLACE_ENABLED=true
VITE_CONSULTING_ENABLED=true
VITE_FRACTIONALIZATION_ENABLED=true

# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZmFpci10YWhyLTM1LmNsZXJrLmFjY291bnRzLmRldiQ

# NFT.Storage Configuration
VITE_NFT_STORAGE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEZFMTI3RDI3MzlhNzJCNDM3RjM3N2M1ODFjMTI5NjY4QjcwMDRFMzAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY5MzQyMDI5MzI3MCwibmFtZSI6IlZlbHRpcyJ9.Nh7D7oRPHEWmA9jKrULG0d7DQZnXYi_bBwQpKQkXNwA

# Alchemy API Key
VITE_ALCHEMY_API_KEY=mJNGWubj_qQYGnXn1mFLcHhiyBftWps7`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created');
}

// Run the build command
try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('🔨 Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
