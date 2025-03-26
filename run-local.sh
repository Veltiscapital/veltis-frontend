#!/bin/bash

echo "Setting up environment for local development..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the setup-local-env.js script to generate env-config.js
echo "Generating environment configuration..."
node setup-local-env.js

echo "Make sure your Hardhat node is running at http://127.0.0.1:8545"

# Start the development server
echo "Starting the development server..."
npm run dev
