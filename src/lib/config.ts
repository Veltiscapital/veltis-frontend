// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
};

// Authentication Configuration
export const AUTH_CONFIG = {
  STORAGE_KEYS: {
    TOKEN: 'auth_token',
    WALLET_ADDRESS: 'wallet_address',
  },
  AUTH_MESSAGE_TEMPLATE: 'Welcome to VELTIS!\n\nPlease sign this message to authenticate.\n\nWallet: {address}\nNonce: {nonce}',
};

// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  NETWORK: import.meta.env.VITE_BLOCKCHAIN_NETWORK || 'polygon-amoy',
  CONTRACTS: {
    IP_NFT_REGISTRY: import.meta.env.VITE_IP_NFT_REGISTRY_CONTRACT || '0x0C0cE3CA0d5d21E2f58a7505Afc7856a36fd1363',
    SIMPLE_IP_NFT_REGISTRY: import.meta.env.VITE_SIMPLE_IP_NFT_REGISTRY_CONTRACT || '0x0C0cE3CA0d5d21E2f58a7505Afc7856a36fd1363',
    FRACTIONALIZATION_FACTORY: import.meta.env.VITE_FRACTIONALIZATION_FACTORY || '0xabcdef123456789abcdef123456789abcdef1234',
    MARKETPLACE: import.meta.env.VITE_MARKETPLACE_CONTRACT || '0x456789abcdef123456789abcdef123456789abcde',
  },
  RPC_URLS: {
    'polygon-amoy': import.meta.env.VITE_POLYGON_AMOY_RPC_URL || 'https://polygon-amoy.g.alchemy.com/v2/mJNGWubj_qQYGnXn1mFLcHhiyBftWps7',
    'polygon-mainnet': import.meta.env.VITE_POLYGON_MAINNET_RPC_URL || 'https://polygon-rpc.com',
  },
  EXPLORER_URLS: {
    'polygon-amoy': 'https://amoy.polygonscan.com',
    'polygon-mainnet': 'https://polygonscan.com',
  },
  CHAIN_IDS: {
    'polygon-amoy': 80002,
    'polygon-mainnet': 137,
  },
};

// Feature Flags
export const FEATURE_FLAGS = {
  KYC_REQUIRED: import.meta.env.VITE_KYC_REQUIRED === 'true',
  MARKETPLACE_ENABLED: import.meta.env.VITE_MARKETPLACE_ENABLED === 'true',
  CONSULTING_ENABLED: import.meta.env.VITE_CONSULTING_ENABLED === 'true',
  FRACTIONALIZATION_ENABLED: import.meta.env.VITE_FRACTIONALIZATION_ENABLED === 'true',
};

// IP-NFT Types
export const IP_TYPES = [
  { value: 'Patent', label: 'Patent' },
  { value: 'Patent Application', label: 'Patent Application' },
  { value: 'Trade Secret', label: 'Trade Secret' },
  { value: 'Copyright', label: 'Copyright' },
  { value: 'Trademark', label: 'Trademark' },
];

// IP-NFT Development Stages
export const DEVELOPMENT_STAGES = [
  { value: 'Discovery', label: 'Discovery' },
  { value: 'Preclinical', label: 'Preclinical' },
  { value: 'Phase I', label: 'Phase I' },
  { value: 'Phase II', label: 'Phase II' },
  { value: 'Phase III', label: 'Phase III' },
  { value: 'Approved', label: 'Approved' },
];

// Platform Fees
export const PLATFORM_FEES = {
  MINT_FEE_PERCENTAGE: 3, // 3% minting fee
  TRANSACTION_FEE_PERCENTAGE: 2.5, // 2.5% transaction fee
  FRACTIONALIZATION_FEE_PERCENTAGE: 2, // 2% fractionalization fee
};

// Verification Levels
export const VERIFICATION_LEVELS = [
  { value: 'unverified', label: 'Unverified', color: 'gray' },
  { value: 'basic', label: 'Basic Verification', color: 'blue' },
  { value: 'institutional', label: 'Institutional', color: 'green' },
  { value: 'expert', label: 'Expert Reviewed', color: 'purple' },
];
