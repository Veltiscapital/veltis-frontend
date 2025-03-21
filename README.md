# Veltis Platform - Frontend

A decentralized platform for intellectual property tokenization, fractionalization, and trading.

## Features

- **IP NFT Tokenization**: Convert intellectual property assets into NFTs
- **Fractionalization**: Divide IP NFTs into tradable fractional tokens
- **Marketplace**: Buy and sell fractional IP tokens
- **Compliance**: Built-in compliance tools with the CMTAT standard and rule engine

## Tech Stack

- React 18
- TypeScript
- Material UI
- Ethers.js
- Web3-React
- React Router
- React Hook Form

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- A web3 wallet (MetaMask, etc.)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/veltis.git
   cd veltis/veltis-frontend
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```
   # Create a .env file in the veltis-frontend directory and add:
   REACT_APP_ENV=development # or staging or production
   REACT_APP_RPC_URL_1=https://mainnet.infura.io/v3/your-infura-key
   REACT_APP_RPC_URL_5=https://goerli.infura.io/v3/your-infura-key
   ```

4. Start the development server
   ```bash
   npm start
   # or
   yarn start
   ```

## Project Structure

```
veltis-frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── fractionalization/
│   │   ├── marketplace/
│   │   └── tokenization/
│   ├── config/
│   │   ├── abis.ts
│   │   └── addresses.ts
│   ├── hooks/
│   ├── pages/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── index.tsx
├── .env
├── package.json
└── tsconfig.json
```

## Development Workflow

1. **Dashboard**: View owned IP NFTs, fractionalized tokens, and marketplace activity
2. **Tokenization**: Create new IP NFTs with metadata and compliance information
3. **Fractionalization**: Divide IP NFTs into tradable tokens
4. **Marketplace**: List, buy, and bid on fractionalized tokens

## Environment Configuration

The application supports three environments:

- **Development**: Local development using localhost blockchain or testnets
- **Staging**: Testing on public testnets (Goerli, Sepolia)
- **Production**: Mainnet deployment

## Contract Integration

The frontend interacts with the following smart contracts:

- IPNFT Registry: For IP NFT minting and management
- Fractionalization Factory: For creating fractional tokens
- Secondary Market: For listing and trading tokens
- Rule Engine: For enforcing compliance
- CMTAT Token: For managing fractional tokens
- Verified Institutions: For verification of institutions

## License

MIT 