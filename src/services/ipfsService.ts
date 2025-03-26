import pinataService from './pinataService';
import { File } from 'nft.storage';
import axios from 'axios';
import { ethers } from 'ethers';
import { IPNFTRegistryService } from './contractService';

// Interface for NFT metadata
export interface IPFSMetadata {
  name: string;
  description: string;
  image: File;
  properties: Record<string, any>;
}

// Pinata credentials from environment variables
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

/**
 * Upload metadata and image to IPFS via Pinata
 * @param metadata Metadata object with name, description, and properties
 * @param imageFile Image file to upload
 * @returns IPFS URI for the uploaded metadata
 */
export const uploadToIPFS = async (
  metadata: Omit<IPFSMetadata, 'image'>, 
  imageFile: File
): Promise<string> => {
  try {
    console.log('Uploading to Pinata IPFS:', { metadata, imageFile });
    
    // Step 1: Upload the image file
    console.log('Uploading image file...');
    const imageCid = await pinataService.uploadFileToPinata(imageFile);
    console.log('Image uploaded, CID:', imageCid);
    
    // Generate image URI with ipfs:// protocol
    const imageUri = `ipfs://${imageCid}`;
    
    // Step 2: Create metadata object including the image URI
    const metadataObj = {
      name: metadata.name,
      description: metadata.description,
      image: imageUri,
      properties: metadata.properties
    };
    
    // Step 3: Upload the metadata JSON
    console.log('Uploading metadata...');
    const metadataCid = await pinataService.uploadJSONToPinata(
      metadataObj,
      `${metadata.name.replace(/\s+/g, '-').toLowerCase()}-metadata.json`
    );
    console.log('Metadata uploaded, CID:', metadataCid);
    
    // Return IPFS URI for the metadata with ipfs:// protocol
    return `ipfs://${metadataCid}`;
  } catch (error) {
    console.error('Error uploading to IPFS via Pinata:', error);
    throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Test the Pinata API connection
 * @returns Test result with success flag and message
 */
export const testApiConnection = async (): Promise<{success: boolean, message: string}> => {
  return pinataService.testPinataConnection();
};

/**
 * Get metadata from IPFS
 * @param uri IPFS URI
 * @returns Metadata object
 */
export const getMetadataFromIPFS = async (uri: string): Promise<any> => {
  try {
    // Convert IPFS URI to HTTP URL using Pinata gateway
    const cid = uri.replace('ipfs://', '');
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw new Error(`Failed to fetch metadata: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Get image URL from IPFS
 * @param cidOrUri IPFS CID or URI or metadata URI
 * @returns Gateway URL for the image
 */
export const getImageUrlFromIPFS = (cidOrUri: string): string => {
  // Handle different formats:
  // 1. Direct CID: QmXyz...
  // 2. IPFS URI: ipfs://QmXyz...
  // 3. Full metadata URI that needs resolution: ipfs://QmMetadata...
  
  try {
    // Remove ipfs:// prefix if present
    const cleanCid = cidOrUri.replace('ipfs://', '');
    
    // Check if this might be a metadata URI instead of an image URI
    if (cleanCid.includes('/metadata.json')) {
      console.warn('getImageUrlFromIPFS was called with a metadata URI');
      // Should properly extract the image from metadata, but for now we'll return a placeholder
      return `https://via.placeholder.com/150?text=Metadata`;
    }
    
    // Use Pinata gateway
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cleanCid}`;
    console.log('Generated IPFS gateway URL:', gatewayUrl);
    return gatewayUrl;
  } catch (error) {
    console.error('Error generating IPFS URL:', error);
    return `https://via.placeholder.com/150?text=Error`;
  }
};

// Function to import IPNFTs from Pinata to Veltis
export const importIPNFTsFromPinata = async (signer: ethers.Signer): Promise<string[]> => {
  try {
    // Get user's wallet address
    const userAddress = await signer.getAddress();
    
    // Step 1: Fetch all pinned items from this user's Pinata account
    const response = await axios.get(
      'https://api.pinata.cloud/data/pinList?status=pinned&metadata[keyvalues]={"source":{"value":"veltis","op":"eq"}}',
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`
        }
      }
    );
    
    if (!response.data || !response.data.rows) {
      throw new Error('Failed to fetch pinned items from Pinata');
    }
    
    console.log('Pinata files found:', response.data.rows.length);
    
    // Step 2: Filter for metadata files (NFT metadata, not images)
    const metadataFiles = response.data.rows.filter((item: any) => 
      item.metadata?.name?.includes('Veltis-IP-Metadata') && 
      !item.metadata?.name?.includes('Image')
    );
    
    console.log('Metadata files found:', metadataFiles.length);
    
    // Step 3: Fetch and process each metadata file
    const importPromises = metadataFiles.map(async (file: any) => {
      try {
        // Fetch the metadata content
        const metadataResponse = await axios.get(
          `https://gateway.pinata.cloud/ipfs/${file.ipfs_pin_hash}`
        );
        
        const metadata = metadataResponse.data;
        console.log('Processing metadata:', metadata);
        
        // Check if this NFT is already minted on the blockchain
        const existingNFTs = await IPNFTRegistryService.getUserNFTs(signer);
        const alreadyMinted = existingNFTs.some(nft => 
          nft.tokenURI === `ipfs://${file.ipfs_pin_hash}`
        );
        
        if (alreadyMinted) {
          console.log(`IPNFT with URI ipfs://${file.ipfs_pin_hash} already minted`);
          return `ipfs://${file.ipfs_pin_hash}`;
        }
        
        // Extract required data for minting
        const title = metadata.name || 'Untitled IP';
        const description = metadata.description || 'No description';
        const category = metadata.properties?.category ? 
          getCategoryId(metadata.properties.category) : 0;
        const valuation = metadata.properties?.valuation ? 
          extractMaticValue(metadata.properties.valuation) : '1';
        
        // Mint the NFT on the blockchain
        const mintTx = await IPNFTRegistryService.mintIPNFT(
          signer,
          title,
          description,
          category,
          ethers.utils.parseEther(valuation),
          `ipfs://${file.ipfs_pin_hash}`
        );
        
        // Wait for transaction confirmation
        // mintTx is a BigNumber (tokenId) according to our contract function
        console.log(`NFT minted with token ID: ${mintTx.toString()}`);
        
        // No need to wait for transaction as mintIPNFT already waits internally
        console.log(`Successfully imported and minted IPNFT: ${title}`);
        
        return `ipfs://${file.ipfs_pin_hash}`;
      } catch (error) {
        console.error(`Error processing metadata file ${file.ipfs_pin_hash}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(importPromises);
    return results.filter((uri): uri is string => uri !== null);
  } catch (error) {
    console.error('Error importing IPNFTs from Pinata:', error);
    throw error;
  }
};

// Helper function to get category ID from name
const getCategoryId = (categoryName: string): number => {
  const categories = [
    { id: 0, name: 'Patent' },
    { id: 1, name: 'Trademark' },
    { id: 2, name: 'Copyright' },
    { id: 3, name: 'Trade Secret' },
    { id: 4, name: 'Design' },
    { id: 5, name: 'Other' }
  ];
  
  const category = categories.find(c => 
    c.name.toLowerCase() === categoryName.toLowerCase()
  );
  
  return category?.id || 5; // Default to "Other" if not found
};

// Helper function to extract MATIC value from string
const extractMaticValue = (valuationString: string): string => {
  // Extract numbers from string like "10 MATIC"
  const match = valuationString.match(/(\d+(\.\d+)?)/);
  return match ? match[0] : '1';
};

export default {
  uploadToIPFS,
  getMetadataFromIPFS,
  getImageUrlFromIPFS,
  testApiConnection,
  importIPNFTsFromPinata
}; 