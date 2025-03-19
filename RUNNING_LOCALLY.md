# Running Veltis Frontend Locally

This guide provides step-by-step instructions for running the Veltis frontend application connected to your locally deployed contracts.

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- A running local Hardhat node with the Veltis contracts deployed

## Setup Instructions

1. **Ensure your Hardhat node is running:**

   Make sure your local Hardhat node is running in a separate terminal window. You should have already deployed the contracts using the scripts provided in the `veltis-contracts` repository.

   ```bash
   # In your veltis-contracts directory
   npx hardhat node
   ```

2. **Configure environment variables:**

   The frontend needs to know the addresses of your deployed contracts. We've created a script to set up the environment variables automatically.

   ```bash
   # In your veltis-frontend directory
   chmod +x run-local.sh
   ./run-local.sh
   ```

   This script will create a `.env.local` file with the correct contract addresses and network configuration for your local Hardhat node.

3. **Start the development server:**

   The `run-local.sh` script will automatically start the development server after setting up the environment, but if you need to start it manually:

   ```bash
   npm run dev
   ```

4. **Access the application:**

   The application will be available at [http://localhost:5173](http://localhost:5173).

## Using the Application

### Connect Your Wallet

1. Click on the "Connect Wallet" button in the top-right corner
2. Select MetaMask or another compatible wallet
3. Make sure you're connected to the Hardhat local network (http://localhost:8545)

### Creating and Fractionalizing an IP-NFT (One-Step)

1. Navigate to the Dashboard
2. Click on "One-Step Process" in the Quick Actions section
3. Fill out the form with details for your IP-NFT and fractionalization
4. Click "Create & Fractionalize" to mint and fractionalize in a single transaction
5. Approve the transaction in your wallet
6. You'll be redirected to the fractionalization details page once successful

### Traditional Minting and Fractionalizing (Two-Step)

1. First mint an IP-NFT:
   - Go to the Dashboard and click "Mint IP-NFT"
   - Fill out the metadata form and submit
   - Approve the transaction in your wallet

2. Then fractionalize it:
   - Go to the Dashboard and click "Fractionalize"
   - Select your IP-NFT from the list
   - Configure the fractionalization parameters
   - Approve the transaction in your wallet

### Interacting with Fractional Tokens

After fractionalizing, you can:
- View your fractional tokens in the "My Vault" section
- Transfer tokens to other addresses
- Buy and sell tokens (if a marketplace is implemented)

## Troubleshooting

### MetaMask Connection Issues

If you have trouble connecting to your local Hardhat node with MetaMask, make sure:

1. The Hardhat network is added to MetaMask with the following settings:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

2. You have imported an account using one of the private keys provided by Hardhat when starting the node. The first account (index 0) is typically used for deployment.

### Transaction Errors

- **Insufficient funds**: Make sure the account you're using has enough ETH for gas and any required fees.
- **Transaction reverted**: Check the console for specific error messages that can help identify the issue.
- **Nonce too high**: Reset your MetaMask account by going to Settings > Advanced > Reset Account.

## Contract Addresses

The frontend is configured to use the following contract addresses deployed on your local Hardhat node:

- VeltisIPNFT: `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`
- VeltisOneStepFractionalization: `0x70e0bA845a1A0F2DA3359C97E0285013525FFC49`

If your contracts were deployed to different addresses, you'll need to update the `.env.local` file accordingly.

## Development Notes

- The frontend uses React, Vite, and TailwindCSS
- Web3 interactions are managed through ethers.js
- For a seamless development experience, keep both the Hardhat node and the frontend development server running
- After restarting the Hardhat node, you'll need to redeploy the contracts and update the contract addresses in `.env.local`

## Next Steps

- Implement a marketplace for buying and selling fractional tokens
- Add more detailed analytics for IP-NFT valuations
- Enhance the UI with more information about fractionalization benefits
- Integrate with IPFS for storing and retrieving metadata 