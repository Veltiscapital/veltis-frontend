import { ethers } from 'ethers';
import { IPNFT_REGISTRY_ABI, RULE_ENGINE_ABI } from '../contracts/abi';

// Contract addresses from environment variables
const CONTRACT_ADDRESSES = {
  ipNftRegistry: import.meta.env.VITE_IP_NFT_REGISTRY_CONTRACT || '',
  ruleEngine: import.meta.env.VITE_VELTIS_RULE_ENGINE || '',
};

// Interface for IP NFT Metadata
export interface IPMetadata {
  title: string;
  description: string;
  category: number;
  valuation: ethers.BigNumber;
  owner: string;
  isVerified: boolean;
  verificationLevel: number;
  createdAt: ethers.BigNumber;
  updatedAt: ethers.BigNumber;
}

/**
 * Get contract instances with the given provider or signer
 */
export const getContracts = (providerOrSigner: ethers.providers.Provider | ethers.Signer) => {
  const ipNftRegistry = new ethers.Contract(
    CONTRACT_ADDRESSES.ipNftRegistry,
    IPNFT_REGISTRY_ABI,
    providerOrSigner
  );

  const ruleEngine = new ethers.Contract(
    CONTRACT_ADDRESSES.ruleEngine,
    RULE_ENGINE_ABI,
    providerOrSigner
  );

  return {
    ipNftRegistry,
    ruleEngine,
  };
};

/**
 * IP NFT Registry service functions
 */
export const IPNFTRegistryService = {
  // Mint a new IP NFT
  mintIPNFT: async (
    signer: ethers.Signer,
    title: string,
    description: string,
    category: number,
    valuation: ethers.BigNumber,
    metadataURI: string
  ): Promise<ethers.BigNumber> => {
    const contracts = getContracts(signer);
    
    const tx = await contracts.ipNftRegistry.mintIPNFT(
      title,
      description,
      category,
      valuation,
      metadataURI
    );
    
    const receipt = await tx.wait();
    const event = receipt.events?.find(e => e.event === 'TokenMinted');
    
    if (!event) {
      throw new Error('Failed to mint IP NFT: TokenMinted event not found');
    }
    
    return event.args.tokenId;
  },
  
  // Get IP NFT metadata
  getIPMetadata: async (
    provider: ethers.providers.Provider,
    tokenId: ethers.BigNumber | number
  ): Promise<IPMetadata> => {
    const contracts = getContracts(provider);
    const metadata = await contracts.ipNftRegistry.getIPMetadata(tokenId);
    
    return {
      title: metadata.title,
      description: metadata.description,
      category: metadata.category,
      valuation: metadata.valuation,
      owner: metadata.owner,
      isVerified: metadata.isVerified,
      verificationLevel: metadata.verificationLevel,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
    };
  },
  
  // Check if a token is locked
  isTokenLocked: async (
    provider: ethers.providers.Provider,
    tokenId: ethers.BigNumber | number
  ): Promise<boolean> => {
    const contracts = getContracts(provider);
    return contracts.ipNftRegistry.tokenLocked(tokenId);
  },
  
  // Get token URI
  getTokenURI: async (
    provider: ethers.providers.Provider,
    tokenId: ethers.BigNumber | number
  ): Promise<string> => {
    const contracts = getContracts(provider);
    return contracts.ipNftRegistry.tokenURI(tokenId);
  },
  
  // Verify a token
  verifyToken: async (
    signer: ethers.Signer,
    tokenId: ethers.BigNumber | number,
    verificationLevel: number
  ): Promise<ethers.ContractReceipt> => {
    const contracts = getContracts(signer);
    const tx = await contracts.ipNftRegistry.verifyToken(tokenId, verificationLevel);
    return tx.wait();
  },
  
  // Update token valuation
  updateValuation: async (
    signer: ethers.Signer,
    tokenId: ethers.BigNumber | number,
    newValuation: ethers.BigNumber
  ): Promise<ethers.ContractReceipt> => {
    const contracts = getContracts(signer);
    const tx = await contracts.ipNftRegistry.updateValuation(tokenId, newValuation);
    return tx.wait();
  },
  
  // Set royalty amount
  setRoyaltyAmount: async (
    signer: ethers.Signer,
    tokenId: ethers.BigNumber | number,
    royaltyAmount: ethers.BigNumber
  ): Promise<ethers.ContractReceipt> => {
    const contracts = getContracts(signer);
    const tx = await contracts.ipNftRegistry.setRoyaltyAmount(tokenId, royaltyAmount);
    return tx.wait();
  },
  
  // Get royalty info
  getRoyaltyInfo: async (
    provider: ethers.providers.Provider,
    tokenId: ethers.BigNumber | number
  ): Promise<{ receiver: string; royaltyAmount: ethers.BigNumber }> => {
    const contracts = getContracts(provider);
    const [receiver, royaltyAmount] = await contracts.ipNftRegistry.getRoyaltyInfo(tokenId);
    return { receiver, royaltyAmount };
  },
  
  // Lock a token
  lockToken: async (
    signer: ethers.Signer,
    tokenId: ethers.BigNumber | number
  ): Promise<ethers.ContractReceipt> => {
    const contracts = getContracts(signer);
    const tx = await contracts.ipNftRegistry.lockToken(tokenId);
    return tx.wait();
  },
  
  // Unlock a token
  unlockToken: async (
    signer: ethers.Signer,
    tokenId: ethers.BigNumber | number
  ): Promise<ethers.ContractReceipt> => {
    const contracts = getContracts(signer);
    const tx = await contracts.ipNftRegistry.unlockToken(tokenId);
    return tx.wait();
  },
  
  // Check if transfer is allowed
  canTransfer: async (
    provider: ethers.providers.Provider,
    from: string,
    to: string,
    tokenId: ethers.BigNumber | number
  ): Promise<boolean> => {
    const contracts = getContracts(provider);
    return contracts.ipNftRegistry.canTransfer(from, to, tokenId);
  },
};

/**
 * Rule Engine service functions
 */
export const RuleEngineService = {
  // Check if an address is blacklisted
  isAddressBlacklisted: async (
    provider: ethers.providers.Provider,
    address: string
  ): Promise<boolean> => {
    const contracts = getContracts(provider);
    return contracts.ruleEngine.blacklistedAddresses(address);
  },
  
  // Check if there's a transfer restriction between addresses
  hasTransferRestriction: async (
    provider: ethers.providers.Provider,
    from: string,
    to: string
  ): Promise<boolean> => {
    const contracts = getContracts(provider);
    return contracts.ruleEngine.transferRestrictions(from, to);
  },
  
  // Check if a token has transfer restrictions
  hasTokenTransferRestriction: async (
    provider: ethers.providers.Provider,
    tokenId: ethers.BigNumber | number
  ): Promise<boolean> => {
    const contracts = getContracts(provider);
    return contracts.ruleEngine.tokenTransferRestrictions(tokenId);
  },
  
  // Get reason for transfer validation
  getTransferValidationReason: async (
    provider: ethers.providers.Provider,
    from: string,
    to: string,
    tokenId: ethers.BigNumber | number
  ): Promise<string> => {
    const contracts = getContracts(provider);
    return contracts.ruleEngine.validateTransferReason(from, to, tokenId);
  },
  
  // Check if contract is paused
  isPaused: async (
    provider: ethers.providers.Provider
  ): Promise<boolean> => {
    const contracts = getContracts(provider);
    return contracts.ruleEngine.paused();
  },
  
  // For admins: Blacklist an address
  blacklistAddress: async (
    signer: ethers.Signer,
    address: string
  ): Promise<ethers.ContractReceipt> => {
    const contracts = getContracts(signer);
    const tx = await contracts.ruleEngine.blacklistAddress(address);
    return tx.wait();
  },
  
  // For admins: Unblacklist an address
  unblacklistAddress: async (
    signer: ethers.Signer,
    address: string
  ): Promise<ethers.ContractReceipt> => {
    const contracts = getContracts(signer);
    const tx = await contracts.ruleEngine.unblacklistAddress(address);
    return tx.wait();
  },
  
  // For operators: Set a transfer restriction between addresses
  setTransferRestriction: async (
    signer: ethers.Signer,
    from: string,
    to: string,
    restricted: boolean
  ): Promise<ethers.ContractReceipt> => {
    const contracts = getContracts(signer);
    const tx = await contracts.ruleEngine.setTransferRestriction(from, to, restricted);
    return tx.wait();
  },
  
  // For operators: Set a token transfer restriction
  setTokenTransferRestriction: async (
    signer: ethers.Signer,
    tokenId: ethers.BigNumber | number,
    restricted: boolean
  ): Promise<ethers.ContractReceipt> => {
    const contracts = getContracts(signer);
    const tx = await contracts.ruleEngine.setTokenTransferRestriction(tokenId, restricted);
    return tx.wait();
  },
  
  // For admins: Pause transfers
  pause: async (
    signer: ethers.Signer
  ): Promise<ethers.ContractReceipt> => {
    const contracts = getContracts(signer);
    const tx = await contracts.ruleEngine.pause();
    return tx.wait();
  },
  
  // For admins: Unpause transfers
  unpause: async (
    signer: ethers.Signer
  ): Promise<ethers.ContractReceipt> => {
    const contracts = getContracts(signer);
    const tx = await contracts.ruleEngine.unpause();
    return tx.wait();
  },
  
  // Check if an address has a role
  hasRole: async (
    provider: ethers.providers.Provider,
    role: string,
    address: string
  ): Promise<boolean> => {
    const contracts = getContracts(provider);
    const roleHash = ethers.utils.id(role);
    return contracts.ruleEngine.hasRole(roleHash, address);
  },
}; 