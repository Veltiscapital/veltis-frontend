// Pinata API service for IPFS storage
import { File } from 'nft.storage';

// Get API keys from environment variables
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET || '';
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';

// Pinata API endpoints
const PINATA_BASE_URL = 'https://api.pinata.cloud';
const PINATA_PIN_FILE_URL = `${PINATA_BASE_URL}/pinning/pinFileToIPFS`;
const PINATA_PIN_JSON_URL = `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`;
const PINATA_PIN_LIST_URL = `${PINATA_BASE_URL}/pinning/pinList`;

/**
 * Debug log function to help troubleshooting
 */
const logDebug = (message: string, data?: any) => {
  console.log(`[Pinata API] ${message}`, data || '');
};

/**
 * Upload a file to IPFS via Pinata
 * @param file The file to upload
 * @returns The IPFS CID (Content Identifier)
 */
export const uploadFileToPinata = async (file: File): Promise<string> => {
  try {
    logDebug('Uploading file to Pinata:', { name: file.name, size: file.size, type: file.type });
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // You can add metadata to your pin
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        app: 'veltis',
        timestamp: Date.now().toString()
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Optional pinata options
    const options = JSON.stringify({
      cidVersion: 1
    });
    formData.append('pinataOptions', options);
    
    // Make API request to pin file
    const response = await fetch(PINATA_PIN_FILE_URL, {
      method: 'POST',
      headers: {
        // You can use either JWT or API key + secret
        ...(PINATA_JWT ? { 'Authorization': `Bearer ${PINATA_JWT}` } : {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_API_SECRET
        })
      },
      body: formData
    });
    
    // Parse response
    const responseData = await response.json();
    logDebug('Pinata response:', responseData);
    
    // Check for errors
    if (!response.ok) {
      const errorMessage = responseData?.error || `API error: ${response.status} ${response.statusText}`;
      logDebug('Error response:', responseData);
      throw new Error(`Failed to upload file to Pinata: ${errorMessage}`);
    }
    
    // Get IPFS hash (CID) from response
    const ipfsHash = responseData.IpfsHash;
    if (!ipfsHash) {
      throw new Error('IPFS hash not found in response');
    }
    
    logDebug('File uploaded successfully to Pinata, CID:', ipfsHash);
    
    return ipfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw new Error(`Failed to upload to Pinata: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Upload JSON metadata to IPFS via Pinata
 * @param jsonData The JSON data to upload
 * @param name Optional name for the metadata
 * @returns The IPFS CID (Content Identifier)
 */
export const uploadJSONToPinata = async (jsonData: any, name = 'metadata.json'): Promise<string> => {
  try {
    logDebug('Uploading JSON to Pinata:', { data: jsonData, name });
    
    // Prepare request body
    const requestBody = {
      pinataContent: jsonData,
      pinataMetadata: {
        name,
        keyvalues: {
          app: 'veltis',
          type: 'metadata',
          timestamp: Date.now().toString()
        }
      },
      pinataOptions: {
        cidVersion: 1
      }
    };
    
    // Make API request to pin JSON
    const response = await fetch(PINATA_PIN_JSON_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You can use either JWT or API key + secret
        ...(PINATA_JWT ? { 'Authorization': `Bearer ${PINATA_JWT}` } : {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_API_SECRET
        })
      },
      body: JSON.stringify(requestBody)
    });
    
    // Parse response
    const responseData = await response.json();
    logDebug('Pinata response:', responseData);
    
    // Check for errors
    if (!response.ok) {
      const errorMessage = responseData?.error || `API error: ${response.status} ${response.statusText}`;
      logDebug('Error response:', responseData);
      throw new Error(`Failed to upload JSON to Pinata: ${errorMessage}`);
    }
    
    // Get IPFS hash (CID) from response
    const ipfsHash = responseData.IpfsHash;
    if (!ipfsHash) {
      throw new Error('IPFS hash not found in response');
    }
    
    logDebug('JSON uploaded successfully to Pinata, CID:', ipfsHash);
    
    return ipfsHash;
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    throw new Error(`Failed to upload JSON to Pinata: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Get a list of pinned items
 * @param filters Optional filters for the list query
 * @returns List of pinned items
 */
export const getPinnedItems = async (filters?: {
  status?: 'pinned' | 'unpinned' | 'all',
  pageLimit?: number,
  pageOffset?: number,
  metadata?: Record<string, string>
}): Promise<any> => {
  try {
    const query = new URLSearchParams();
    
    // Add filters to query params
    if (filters) {
      if (filters.status) query.append('status', filters.status);
      if (filters.pageLimit) query.append('pageLimit', filters.pageLimit.toString());
      if (filters.pageOffset) query.append('pageOffset', filters.pageOffset.toString());
      
      // Add metadata filters if present
      if (filters.metadata) {
        for (const [key, value] of Object.entries(filters.metadata)) {
          query.append(`metadata[${key}]`, value);
        }
      }
    }
    
    // Make API request to get pin list
    const response = await fetch(`${PINATA_PIN_LIST_URL}?${query.toString()}`, {
      method: 'GET',
      headers: {
        // You can use either JWT or API key + secret
        ...(PINATA_JWT ? { 'Authorization': `Bearer ${PINATA_JWT}` } : {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_API_SECRET
        })
      }
    });
    
    // Parse response
    const responseData = await response.json();
    
    // Check for errors
    if (!response.ok) {
      const errorMessage = responseData?.error || `API error: ${response.status} ${response.statusText}`;
      throw new Error(`Failed to get pinned items: ${errorMessage}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Error getting pinned items:', error);
    throw new Error(`Failed to get pinned items: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Test the Pinata API connection
 * @returns Test result with success flag and message
 */
export const testPinataConnection = async (): Promise<{success: boolean, message: string}> => {
  try {
    logDebug('Testing Pinata API connection');
    
    // Try to get pin list as a simple test
    const response = await fetch(`${PINATA_PIN_LIST_URL}?status=pinned&pageLimit=1`, {
      method: 'GET',
      headers: {
        // You can use either JWT or API key + secret
        ...(PINATA_JWT ? { 'Authorization': `Bearer ${PINATA_JWT}` } : {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_API_SECRET
        })
      }
    });
    
    // Parse response
    const responseData = await response.json();
    logDebug('Test response:', responseData);
    
    if (response.ok) {
      const count = responseData.count !== undefined ? responseData.count : 'unknown';
      return { 
        success: true, 
        message: `Pinata API connection successful. You have ${count} pinned items.` 
      };
    } else {
      return { 
        success: false, 
        message: `Pinata API error: ${responseData?.error || response.statusText}` 
      };
    }
  } catch (error) {
    console.error('Pinata API test error:', error);
    return { 
      success: false, 
      message: `Connection error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Get full gateway URL for an IPFS hash
 * @param cid IPFS CID/Hash
 * @returns Fully qualified gateway URL
 */
export const getIPFSGatewayURL = (cid: string): string => {
  // Remove ipfs:// prefix if present
  const cleanCid = cid.replace('ipfs://', '');
  
  // Use Pinata gateway or public IPFS gateway
  return `https://gateway.pinata.cloud/ipfs/${cleanCid}`;
};

export default {
  uploadFileToPinata,
  uploadJSONToPinata,
  getPinnedItems,
  testPinataConnection,
  getIPFSGatewayURL
}; 