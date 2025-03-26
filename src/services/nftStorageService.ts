import { NFTStorage, File } from 'nft.storage';

// Get API key from environment variables
const NFT_STORAGE_API_KEY = import.meta.env.VITE_NFT_STORAGE_API_KEY;

/**
 * Validates NFT.Storage API key format
 * @returns true if API key appears to be valid
 */
const validateApiKey = (): boolean => {
  if (!NFT_STORAGE_API_KEY) {
    console.error('NFT.Storage API key is missing');
    return false;
  }
  
  // Check if API key looks like a JWT (starts with "ey")
  if (!NFT_STORAGE_API_KEY.startsWith('ey')) {
    console.error('NFT.Storage API key does not appear to be in JWT format');
    return false;
  }
  
  // Check if API key has 3 parts separated by periods
  const parts = NFT_STORAGE_API_KEY.split('.');
  if (parts.length !== 3) {
    console.error('NFT.Storage API key is not in valid JWT format (should have 3 parts)');
    return false;
  }
  
  return true;
};

/**
 * Creates a new NFT.Storage client
 */
const createNFTStorageClient = () => {
  if (!validateApiKey()) {
    throw new Error('Invalid NFT.Storage API key format. Please check your API key.');
  }
  
  try {
    return new NFTStorage({ token: NFT_STORAGE_API_KEY });
  } catch (error) {
    console.error('Error creating NFT.Storage client:', error);
    throw new Error(`Failed to initialize NFT.Storage client: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Upload a file to IPFS using NFT.Storage
 * @param file File to upload
 * @returns IPFS CID for the file
 */
export const uploadFile = async (file: File): Promise<string> => {
  try {
    console.log('Creating NFT.Storage client...');
    const client = createNFTStorageClient();
    
    console.log('Uploading file to NFT.Storage:', { name: file.name, size: file.size, type: file.type });
    
    // Upload to NFT.Storage
    const cid = await client.storeBlob(file);
    console.log('File upload successful, CID:', cid);
    
    return cid;
  } catch (error) {
    console.error('Error uploading file to NFT.Storage:', error);
    throw new Error(`Failed to upload file to NFT.Storage: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Upload metadata to IPFS using NFT.Storage
 * @param metadata Metadata object
 * @param imageFile Optional image file
 * @returns IPFS URI for the metadata
 */
export const uploadNFT = async (
  metadata: {
    name: string;
    description: string;
    properties?: Record<string, any>;
  },
  imageFile?: File
): Promise<string> => {
  try {
    console.log('Creating NFT.Storage client...');
    const client = createNFTStorageClient();
    
    console.log('Preparing NFT data:', { metadata, imageFile });
    
    // Create NFT metadata with image file if provided
    const nftData: any = {
      name: metadata.name,
      description: metadata.description,
      properties: metadata.properties || {}
    };
    
    if (imageFile) {
      nftData.image = new File([imageFile], imageFile.name, { type: imageFile.type });
    }
    
    // Upload to NFT.Storage
    console.log('Storing NFT data...');
    const result = await client.store(nftData);
    console.log('NFT data stored successfully:', result);
    
    // Return IPFS URI
    return result.url;
  } catch (error) {
    console.error('Error storing NFT data:', error);
    throw new Error(`Failed to store NFT data: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Get status of stored data
 * @param cid IPFS CID to check
 * @returns Status object from NFT.Storage
 */
export const checkStatus = async (cid: string): Promise<any> => {
  try {
    console.log('Checking status for CID:', cid);
    const client = createNFTStorageClient();
    
    const status = await client.status(cid);
    console.log('Status result:', status);
    
    return status;
  } catch (error) {
    console.error('Error checking status:', error);
    throw new Error(`Failed to check status: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export default {
  uploadFile,
  uploadNFT,
  checkStatus
}; 