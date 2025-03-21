import { NFTStorage, File } from 'nft.storage';

// Get API key from environment variables
const NFT_STORAGE_KEY = import.meta.env.VITE_NFT_STORAGE_API_KEY as string;

// Create NFT.Storage client
const client = new NFTStorage({ token: NFT_STORAGE_KEY });

// Interface for NFT metadata
export interface IPFSMetadata {
  name: string;
  description: string;
  image: File;
  properties: Record<string, any>;
}

/**
 * Upload metadata and image to IPFS via NFT.Storage
 * @param metadata Metadata object with name, description, and properties
 * @param imageFile Image file to upload
 * @returns IPFS URI for the uploaded metadata
 */
export const uploadToNFTStorage = async (
  metadata: Omit<IPFSMetadata, 'image'>, 
  imageFile: File
): Promise<string> => {
  if (!NFT_STORAGE_KEY) {
    console.warn('NFT.Storage API key is not set. Using mock IPFS URI.');
    return `ipfs://mock-ipfs-hash-${Date.now()}`;
  }

  try {
    console.log('Uploading to NFT.Storage:', { metadata, imageFile });
    
    // Create NFT metadata with image file
    const nftMetadata = {
      name: metadata.name,
      description: metadata.description,
      image: new File([imageFile], imageFile.name, { type: imageFile.type }),
      properties: metadata.properties
    };

    // Upload to NFT.Storage
    const result = await client.store(nftMetadata);
    console.log('NFT.Storage upload successful:', result);
    
    // Return IPFS URI
    return result.url;
  } catch (error) {
    console.error('Error uploading to NFT.Storage:', error);
    throw new Error(`Failed to upload to NFT.Storage: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Get metadata from IPFS URI
 * @param ipfsUri IPFS URI
 * @returns Metadata object
 */
export const getMetadataFromIPFS = async (ipfsUri: string): Promise<any> => {
  try {
    // Convert IPFS URI to HTTP URL
    const url = ipfsUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
    console.log('Fetching metadata from IPFS:', url);
    
    // Fetch metadata
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    // Parse JSON
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    
    // Return mock metadata for demo purposes
    if (ipfsUri.includes('mock-ipfs-hash')) {
      return {
        name: "Mock NFT",
        description: "This is a mock NFT for demonstration purposes",
        image: "https://via.placeholder.com/350",
        properties: {
          category: 0,
          developmentStage: 3,
          valuation: "5"
        }
      };
    }
    
    throw new Error(`Failed to fetch from IPFS: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Get image URL from IPFS URI
 * @param ipfsUri IPFS URI for image
 * @returns HTTP URL for image
 */
export const getImageUrlFromIPFS = (ipfsUri: string): string => {
  // Handle empty URI
  if (!ipfsUri) return '';
  
  // Handle mock URIs for demo purposes
  if (ipfsUri.includes('mock-ipfs-hash')) {
    return `https://picsum.photos/seed/${ipfsUri.split('-').pop()}/350/350`;
  }
  
  // Convert IPFS URI to HTTP URL
  return ipfsUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
};

export default {
  uploadToNFTStorage,
  getMetadataFromIPFS,
  getImageUrlFromIPFS
}; 