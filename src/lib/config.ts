// Blockchain configuration
export const BLOCKCHAIN_CONFIG = {
  // Network configuration
  NETWORK: import.meta.env.VITE_BLOCKCHAIN_NETWORK || 'hardhat',
  CHAIN_ID: parseInt(import.meta.env.VITE_CHAIN_ID || '31337', 10),
  NETWORK_NAME: import.meta.env.VITE_NETWORK_NAME || 'Hardhat Local',
  RPC_URL: import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545',
  
  // Contract addresses
  CONTRACTS: {
    IP_NFT_REGISTRY: import.meta.env.VITE_IP_NFT_REGISTRY_CONTRACT || '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    SIMPLE_IP_NFT_REGISTRY: import.meta.env.VITE_SIMPLE_IP_NFT_REGISTRY_CONTRACT || '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    FRACTIONALIZATION_FACTORY: import.meta.env.VITE_FRACTIONALIZATION_FACTORY || '0x70e0bA845a1A0F2DA3359C97E0285013525FFC49',
    ONE_STEP_FRACTIONALIZATION: import.meta.env.VITE_ONE_STEP_FRACTIONALIZATION || '0x70e0bA845a1A0F2DA3359C97E0285013525FFC49',
  },
  
  // IPFS configuration
  IPFS: {
    GATEWAY: 'https://ipfs.io/ipfs/',
    API_URL: 'https://api.pinata.cloud/pinning/',
    API_KEY: import.meta.env.VITE_PINATA_API_KEY || '',
    API_SECRET: import.meta.env.VITE_PINATA_API_SECRET || '',
  },
};

// API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000, // 30 seconds
};

// Application configuration
export const APP_CONFIG = {
  NAME: 'Veltis',
  VERSION: '0.1.0',
  DESCRIPTION: 'Tokenize and fractionalize biotech IP assets',
  CONTACT_EMAIL: 'info@veltis.io',
  SOCIAL: {
    TWITTER: 'https://twitter.com/veltis',
    DISCORD: 'https://discord.gg/veltis',
    GITHUB: 'https://github.com/veltis',
  },
};

// Feature flags
export const FEATURES = {
  ENABLE_MARKETPLACE: true,
  ENABLE_FRACTIONALIZATION: true,
  ENABLE_ONE_STEP_FRACTIONALIZATION: true,
  ENABLE_ANALYTICS: true,
  ENABLE_CONSULTING: true,
};

// IP-NFT types
export const IP_TYPES = [
  { id: 'patent', label: 'Patent' },
  { id: 'trademark', label: 'Trademark' },
  { id: 'copyright', label: 'Copyright' },
  { id: 'trade_secret', label: 'Trade Secret' },
  { id: 'software', label: 'Software' },
  { id: 'data', label: 'Data' },
  { id: 'research', label: 'Research' },
  { id: 'other', label: 'Other' },
];

// Development stages
export const DEVELOPMENT_STAGES = [
  { id: 'discovery', label: 'Discovery' },
  { id: 'preclinical', label: 'Preclinical' },
  { id: 'phase1', label: 'Phase 1' },
  { id: 'phase2', label: 'Phase 2' },
  { id: 'phase3', label: 'Phase 3' },
  { id: 'approved', label: 'Approved' },
  { id: 'marketed', label: 'Marketed' },
  { id: 'development', label: 'Development' },
  { id: 'prototype', label: 'Prototype' },
  { id: 'mvp', label: 'MVP' },
  { id: 'production', label: 'Production' },
];

// Verification levels
export const VERIFICATION_LEVELS = [
  { id: 'unverified', label: 'Unverified', description: 'No verification has been performed' },
  { id: 'basic', label: 'Basic', description: 'Basic verification of ownership and documentation' },
  { id: 'institutional', label: 'Institutional', description: 'Verified by an institutional partner' },
  { id: 'expert', label: 'Expert Reviewed', description: 'Reviewed by domain experts' },
];
