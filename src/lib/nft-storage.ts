import { NFTStorage, File } from 'nft.storage';

// NFT.Storage API key - in production, this should be in an environment variable
const NFT_STORAGE_API_KEY = import.meta.env.VITE_NFT_STORAGE_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEZFMTI3RDI3MzlhNzJCNDM3RjM3N2M1ODFjMTI5NjY4QjcwMDRFMzAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY5MzQyMDI5MzI3MCwibmFtZSI6IlZlbHRpcyJ9.Nh7D7oRPHEWmA9jKrULG0d7DQZnXYi_bBwQpKQkXNwA';

// Initialize NFT.Storage client
const initNFTStorage = () => {
  if (!NFT_STORAGE_API_KEY) {
    throw new Error('NFT.Storage API key is not configured');
  }
  return new NFTStorage({ token: NFT_STORAGE_API_KEY });
};

/**
 * Uploads a file to IPFS via NFT.storage
 * @param file The file to upload
 * @returns The IPFS CID for the uploaded file
 */
export const uploadFileToIPFS = async (file: File): Promise<string> => {
  try {
    console.log('Uploading file to IPFS:', file.name, file.size, file.type);
    const client = initNFTStorage();
    const cid = await client.storeBlob(file);
    console.log('File uploaded successfully, CID:', cid);
    return cid;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
    throw new Error('Failed to upload file to IPFS: Unknown error');
  }
};

/**
 * Creates and uploads NFT metadata to IPFS
 * @param metadata The NFT metadata
 * @param file Optional file to include with the metadata
 * @returns The IPFS URI for the metadata
 */
export const uploadNFTMetadata = async (
  metadata: {
    name: string;
    description: string;
    image?: File;
    properties: Record<string, any>;
  },
  file?: File
): Promise<string> => {
  try {
    console.log('Uploading NFT metadata to IPFS:', metadata.name);
    const client = initNFTStorage();
    
    // If a file is provided, upload it first and get its CID
    let documentCid = '';
    if (file) {
      console.log('Uploading document file:', file.name, file.size, file.type);
      try {
        documentCid = await uploadFileToIPFS(file);
        console.log('Document uploaded successfully, CID:', documentCid);
      } catch (fileError) {
        console.error('Error uploading document:', fileError);
        throw new Error(`Document upload failed: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
      }
    }
    
    // Create the NFT metadata
    const nftMetadata = {
      name: metadata.name,
      description: metadata.description,
      image: metadata.image ? new File([metadata.image], metadata.image.name, { type: metadata.image.type }) : undefined,
      properties: {
        ...metadata.properties,
        documentCid: documentCid || undefined,
      },
    };
    
    console.log('Storing NFT metadata:', nftMetadata);
    
    // Store the NFT metadata
    const metadataUri = await client.store(nftMetadata);
    console.log('Metadata stored successfully, URI:', metadataUri.url);
    return metadataUri.url;
  } catch (error) {
    console.error('Error uploading NFT metadata to IPFS:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload NFT metadata to IPFS: ${error.message}`);
    }
    throw new Error('Failed to upload NFT metadata to IPFS: Unknown error');
  }
};

/**
 * Gets the IPFS gateway URL for a CID
 * @param cid The IPFS CID
 * @returns The gateway URL
 */
export const getIPFSGatewayURL = (cid: string): string => {
  // Remove ipfs:// prefix if present
  const cleanCid = cid.replace('ipfs://', '');
  return `https://nftstorage.link/ipfs/${cleanCid}`;
};

/**
 * Fetches metadata from IPFS
 * @param uri The IPFS URI
 * @returns The metadata object
 */
export const fetchMetadataFromIPFS = async (uri: string): Promise<any> => {
  try {
    const url = getIPFSGatewayURL(uri);
    console.log('Fetching metadata from:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Metadata fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch metadata from IPFS: ${error.message}`);
    }
    throw new Error('Failed to fetch metadata from IPFS: Unknown error');
  }
}; 