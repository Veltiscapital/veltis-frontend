// This is a simplified mock implementation of the Alchemy SDK functionality
// In a real application, you would import and use the actual Alchemy SDK

// Define types for NFT data
export interface AlchemyNFT {
  contract: {
    address: string;
  };
  tokenId: string;
  name: string;
  description: string;
  tokenUri?: string | { raw?: string };
}

export interface OwnedNFTsResponse {
  ownedNfts: AlchemyNFT[];
  totalCount: number;
  blockHash: string;
}

// Mock function to get NFTs for an owner
export async function getNFTsForOwner(ownerAddress: string): Promise<OwnedNFTsResponse> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data
  return {
    ownedNfts: [
      {
        contract: {
          address: import.meta.env.VITE_IP_NFT_REGISTRY_CONTRACT || '0x1234567890123456789012345678901234567890',
        },
        tokenId: '1',
        name: 'Immunotherapy Patent',
        description: 'Novel immunotherapy approach for treating autoimmune diseases',
        tokenUri: {
          raw: 'ipfs://QmXyZ123456789abcdef/metadata.json',
        },
      },
      {
        contract: {
          address: import.meta.env.VITE_IP_NFT_REGISTRY_CONTRACT || '0x1234567890123456789012345678901234567890',
        },
        tokenId: '2',
        name: 'Drug Delivery System',
        description: 'Targeted drug delivery system using nanoparticles',
        tokenUri: {
          raw: 'ipfs://QmAbcdef123456789xyz/metadata.json',
        },
      },
      {
        contract: {
          address: '0x0987654321098765432109876543210987654321', // Different contract
        },
        tokenId: '3',
        name: 'Other NFT',
        description: 'This is not an IP-NFT',
        tokenUri: {
          raw: 'ipfs://QmOther123456789/metadata.json',
        },
      },
    ],
    totalCount: 3,
    blockHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  };
}

// Added for compatibility with pages that import this function
export async function getIPNFTsForOwner(ownerAddress: string): Promise<any[]> {
  const response = await getNFTsForOwner(ownerAddress);
  // Filter to only IPNFT contract NFTs and transform to the expected format
  return response.ownedNfts
    .filter(nft => 
      nft.contract.address.toLowerCase() === 
      (import.meta.env.VITE_IP_NFT_REGISTRY_CONTRACT || '0x1234567890123456789012345678901234567890').toLowerCase()
    )
    .map(nft => ({
      id: nft.tokenId,
      name: nft.name,
      description: nft.description || 'No description available',
      status: 'active',
      tokenId: nft.tokenId,
      tokenUri: typeof nft.tokenUri === 'string' ? nft.tokenUri : 
                (nft.tokenUri?.raw || ''),
      ipType: 'Patent',
      owner: ownerAddress,
      valuation: Math.floor(Math.random() * 5000000 + 1000000).toString(), // Mock valuation
      stage: ['Discovery', 'Preclinical', 'Phase 1', 'Phase 2', 'Phase 3'][Math.floor(Math.random() * 5)],
      verificationLevel: ['Unverified', 'Basic', 'Institutional', 'Expert Reviewed'][Math.floor(Math.random() * 4)],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
}

// Mock function to get NFT metadata
export async function getNFTMetadata(contractAddress: string, tokenId: string): Promise<AlchemyNFT> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data
  return {
    contract: {
      address: contractAddress,
    },
    tokenId,
    name: 'IP-NFT #' + tokenId,
    description: 'Intellectual Property NFT',
    tokenUri: {
      raw: 'ipfs://QmMetadata123456789/metadata.json',
    },
  };
}
