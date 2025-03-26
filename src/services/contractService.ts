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

// Add an interface for NFT with tokenURI
export interface NFTWithURI {
  tokenId: string;
  metadata: IPMetadata;
  tokenURI: string;
  imageUrl?: string;
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
  
  // Add a method to get the latest token ID for the current user
  getLatestTokenId: async (
    signer: ethers.Signer
  ): Promise<ethers.BigNumber | null> => {
    try {
      const contracts = getContracts(signer.provider);
      const account = await signer.getAddress();
      
      // Get the total balance of NFTs for this account
      const balance = await contracts.ipNftRegistry.balanceOf(account);
      
      if (balance.toNumber() > 0) {
        // Get the most recently minted token (last index)
        const tokenId = await contracts.ipNftRegistry.tokenOfOwnerByIndex(
          account, 
          balance.toNumber() - 1
        );
        
        return tokenId;
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving latest token ID:', error);
      return null;
    }
  },

  // Add a method to get all NFTs owned by a user
  getUserNFTs: async (
    signer: ethers.Signer
  ): Promise<NFTWithURI[]> => {
    try {
      const contracts = getContracts(signer.provider);
      const account = await signer.getAddress();
      
      // Get the total balance of NFTs for this account
      const balance = await contracts.ipNftRegistry.balanceOf(account);
      
      if (balance.toNumber() === 0) {
        return [];
      }
      
      const nftsPromises = [];
      
      // Loop through each token by index to get tokenId
      for (let i = 0; i < balance.toNumber(); i++) {
        try {
          const tokenId = await contracts.ipNftRegistry.tokenOfOwnerByIndex(account, i);
          
          // Get metadata and token URI for this token
          const metadata = await IPNFTRegistryService.getIPMetadata(signer.provider, tokenId);
          const tokenURI = await contracts.ipNftRegistry.tokenURI(tokenId);
          
          nftsPromises.push({
            tokenId: tokenId.toString(),
            metadata,
            tokenURI
          });
        } catch (error) {
          console.error(`Error fetching token at index ${i}:`, error);
        }
      }
      
      return await Promise.all(nftsPromises);
    } catch (error) {
      console.error('Error retrieving user NFTs:', error);
      return [];
    }
  },

  // Add a new function to extract tokenId from transaction receipt
  getTokenIdFromTransactionReceipt: async (
    receipt: ethers.providers.TransactionReceipt
  ): Promise<string | null> => {
    try {
      // Define the ERC721 Transfer event signature
      const transferEventSignature = ethers.utils.id("Transfer(address,address,uint256)");
      
      // Find the Transfer event in the logs
      const transferLog = receipt.logs.find(log => 
        log.topics[0] === transferEventSignature
      );
      
      if (transferLog && transferLog.topics.length >= 4) {
        // The tokenId is in the third topic (index 3)
        const tokenId = ethers.BigNumber.from(transferLog.topics[3]);
        console.log('Token ID extracted from logs:', tokenId.toString());
        return tokenId.toString();
      }
      
      // If we can't extract from logs directly, use an alternative method
      console.warn('Could not extract token ID from transaction receipt logs');
      return null;
    } catch (error) {
      console.error('Error extracting token ID from receipt:', error);
      return null;
    }
  },

  // Add a function to directly query an NFT by its ID
  // This bypasses the tokenOfOwnerByIndex enumeration which might be unreliable immediately after minting
  getNFTById: async (
    provider: ethers.providers.Provider,
    tokenId: string
  ): Promise<NFTWithURI | null> => {
    try {
      if (!tokenId) {
        console.warn('No token ID provided to getNFTById');
        return null;
      }
      
      console.log(`Directly querying NFT with ID: ${tokenId}`);
      const contracts = getContracts(provider);
      
      // Convert string tokenId to BigNumber for contract calls
      const tokenIdBN = ethers.BigNumber.from(tokenId);
      
      // Verify token exists and get owner
      let owner;
      try {
        owner = await contracts.ipNftRegistry.ownerOf(tokenIdBN);
      } catch (error) {
        console.error(`Token ${tokenId} does not exist or error querying owner:`, error);
        return null;
      }
      
      console.log(`Token ${tokenId} owner:`, owner);
      
      // Get metadata and URI using BigNumber
      const metadata = await IPNFTRegistryService.getIPMetadata(provider, tokenIdBN);
      const tokenURI = await contracts.ipNftRegistry.tokenURI(tokenIdBN);
      
      console.log(`Retrieved metadata and URI for token ${tokenId}:`, {
        metadata,
        tokenURI
      });
      
      // Try to get IPFS metadata
      let ipfsMetadata = null;
      if (tokenURI && tokenURI.startsWith('ipfs://')) {
        try {
          const cleanURI = tokenURI.replace('ipfs://', '');
          // Add cache busting
          const cacheBuster = `?t=${Date.now()}`;
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cleanURI}${cacheBuster}`);
          
          if (response.ok) {
            ipfsMetadata = await response.json();
            console.log(`Successfully fetched IPFS metadata for token ${tokenId}:`, ipfsMetadata);
          }
        } catch (error) {
          console.error(`Error fetching IPFS metadata for token ${tokenId}:`, error);
        }
      }
      
      // Determine image URL
      let imageUrl = null;
      if (ipfsMetadata && ipfsMetadata.image) {
        imageUrl = ipfsMetadata.image.startsWith('ipfs://') 
          ? ipfsMetadata.image 
          : `ipfs://${ipfsMetadata.image}`;
      }
      
      // Create NFT object
      return {
        tokenId,
        metadata: {
          ...metadata,
          title: ipfsMetadata?.name || metadata.title,
          description: ipfsMetadata?.description || metadata.description,
        },
        tokenURI,
        imageUrl
      };
    } catch (error) {
      console.error(`Error in getNFTById for token ${tokenId}:`, error);
      return null;
    }
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