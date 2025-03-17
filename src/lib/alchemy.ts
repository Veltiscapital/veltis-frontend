import { Network, Alchemy, AssetTransfersCategory } from "alchemy-sdk";
import { BLOCKCHAIN_CONFIG } from './config';

// Determine the network based on configuration
const getAlchemyNetwork = () => {
  const network = BLOCKCHAIN_CONFIG.NETWORK;
  if (network === 'polygon-mainnet') return Network.MATIC_MAINNET;
  // For Amoy testnet, use MATIC_MUMBAI as it's the closest available option
  if (network === 'polygon-amoy') return Network.MATIC_MUMBAI;
  return Network.MATIC_MUMBAI; // Default to Mumbai testnet
};

// Extract API key from RPC URL
const getAlchemyApiKey = () => {
  const rpcUrl = BLOCKCHAIN_CONFIG.RPC_URLS['polygon-amoy'];
  // Extract API key from the URL
  const apiKey = rpcUrl.split('/').pop() || 'mJNGWubj_qQYGnXn1mFLcHhiyBftWps7';
  return apiKey;
};

// Initialize Alchemy SDK
export const initAlchemy = () => {
  const apiKey = getAlchemyApiKey();
  
  const settings = {
    apiKey,
    network: getAlchemyNetwork(),
  };
  
  return new Alchemy(settings);
};

// Get NFTs owned by an address
export const getNFTsForOwner = async (ownerAddress: string) => {
  try {
    const alchemy = initAlchemy();
    const nfts = await alchemy.nft.getNftsForOwner(ownerAddress);
    return nfts;
  } catch (error) {
    console.error('Error fetching NFTs from Alchemy:', error);
    throw error;
  }
};

// Get IP-NFTs owned by an address (filtered by contract)
export const getIPNFTsForOwner = async (ownerAddress: string) => {
  try {
    const alchemy = initAlchemy();
    const nfts = await alchemy.nft.getNftsForOwner(ownerAddress, {
      contractAddresses: [BLOCKCHAIN_CONFIG.CONTRACTS.SIMPLE_IP_NFT_REGISTRY]
    });
    
    return nfts.ownedNfts.map(nft => {
      // Parse metadata from the token URI
      let metadata: any = {};
      try {
        if (nft.rawMetadata) {
          metadata = nft.rawMetadata;
        }
      } catch (e) {
        console.error('Error parsing NFT metadata:', e);
      }
      
      return {
        id: nft.tokenId,
        tokenId: nft.tokenId,
        name: nft.title || `IP-NFT #${nft.tokenId}`,
        title: nft.title || `IP-NFT #${nft.tokenId}`,
        description: nft.description || '',
        contract_address: nft.contract.address,
        ipType: metadata?.properties?.ipType || 'Unknown',
        developmentStage: metadata?.properties?.developmentStage || 'Unknown',
        authors: metadata?.properties?.authors || '',
        institution: metadata?.properties?.institution || '',
        imageUrl: nft.media[0]?.gateway || '',
        metadataUri: nft.tokenUri?.raw || '',
        valuation: '0', // This would need to be fetched from the contract
      };
    });
  } catch (error) {
    console.error('Error fetching IP-NFTs from Alchemy:', error);
    throw error;
  }
};

// Get a specific NFT by contract address and token ID
export const getNFTMetadata = async (contractAddress: string, tokenId: string) => {
  try {
    const alchemy = initAlchemy();
    const nft = await alchemy.nft.getNftMetadata(contractAddress, tokenId);
    return nft;
  } catch (error) {
    console.error('Error fetching NFT metadata from Alchemy:', error);
    throw error;
  }
};

// Get all NFTs for a specific contract
export const getNFTsForContract = async (contractAddress: string) => {
  try {
    const alchemy = initAlchemy();
    const nfts = await alchemy.nft.getNftsForContract(contractAddress);
    return nfts;
  } catch (error) {
    console.error('Error fetching NFTs for contract from Alchemy:', error);
    throw error;
  }
};

// Get transfers for a specific NFT
export const getTransfersForNFT = async (contractAddress: string, tokenId: string) => {
  try {
    const alchemy = initAlchemy();
    const transfers = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      toBlock: "latest",
      contractAddresses: [contractAddress],
      category: [AssetTransfersCategory.ERC721],
    });
    
    // Filter transfers for the specific token ID
    const tokenTransfers = transfers.transfers.filter(transfer => 
      transfer.tokenId === tokenId
    );
    
    return tokenTransfers;
  } catch (error) {
    console.error('Error fetching transfers for NFT from Alchemy:', error);
    throw error;
  }
};

// Get the owner of an NFT
export const getOwnerOfNFT = async (contractAddress: string, tokenId: string) => {
  try {
    const alchemy = initAlchemy();
    const owner = await alchemy.nft.getOwnersForNft(contractAddress, tokenId);
    return owner.owners[0] || null;
  } catch (error) {
    console.error('Error fetching NFT owner from Alchemy:', error);
    throw error;
  }
};
