// Direct API implementation for NFT.Storage (new version) based on https://app.nft.storage

// Get API key from environment variables - use as is, no validation
const NFT_STORAGE_API_KEY = import.meta.env.VITE_NFT_STORAGE_API_KEY;

// Base URL for the new API
const API_BASE_URL = 'https://api.nft.storage';

/**
 * Debug log function to help troubleshooting
 */
const logDebug = (message: string, data?: any) => {
  console.log(`[NFT.Storage API] ${message}`, data || '');
};

/**
 * Creates a collection on NFT.Storage
 * @param contractAddress Address of the collection contract
 * @param collectionName Name of the collection
 * @param chainID Blockchain ID
 * @param network Blockchain network name
 * @returns Collection ID
 */
export const createCollection = async (
  contractAddress: string,
  collectionName: string,
  chainID: string,
  network: string
): Promise<string> => {
  try {
    logDebug('Creating a custom collection is not supported in the new API', { contractAddress, collectionName, chainID, network });
    
    // The new API doesn't have a direct collection creation endpoint
    // We'll simulate a collection ID to maintain compatibility with existing code
    const collectionID = `simulated-collection-${Date.now()}`;
    
    return collectionID;
  } catch (error) {
    console.error('Error simulating collection:', error);
    throw new Error(`Failed to simulate collection: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Adds tokens to a collection on NFT.Storage
 * @param collectionID ID of the collection
 * @param tokens Array of token objects with tokenId and cid
 * @returns Response from the API
 */
export const addTokensToCollection = async (
  collectionID: string,
  tokens: Array<{ tokenId: string, cid: string }>
): Promise<any> => {
  try {
    logDebug('Adding tokens to collection is not directly supported in the new API', { collectionID, tokens });
    
    // The new API doesn't have a token-to-collection endpoint
    // We'll just return success to maintain compatibility
    return { 
      success: true, 
      message: "Token registration simulated for new API compatibility" 
    };
  } catch (error) {
    console.error('Error simulating token addition:', error);
    throw new Error(`Failed to simulate token addition: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Upload a file to IPFS using the new NFT.Storage API
 * @param file The file to upload
 * @returns The IPFS CID
 */
export const uploadFileDirect = async (file: File): Promise<string> => {
  try {
    logDebug('Uploading file directly to new NFT.Storage API:', { name: file.name, size: file.size, type: file.type });
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Make direct upload request to IPFS
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NFT_STORAGE_API_KEY}`
      },
      body: formData
    });
    
    // Parse response
    const responseText = await response.text();
    logDebug('Response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Failed to parse response: ${responseText}`);
    }
    
    // Check for errors
    if (!response.ok) {
      const errorMessage = data?.error?.message || `API error: ${response.status} ${response.statusText}`;
      logDebug('Error response:', data);
      throw new Error(`Failed to upload file: ${errorMessage}`);
    }
    
    // Get CID from response
    const cid = data?.value?.cid;
    if (!cid) {
      throw new Error('CID not found in response');
    }
    
    logDebug('File uploaded successfully, CID:', cid);
    
    return cid;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Get deal status for a CID - not directly supported in new API
 * @param cid The CID to check status for
 * @returns Deal status information
 */
export const getDealStatus = async (cid: string): Promise<any> => {
  try {
    logDebug('Getting status for CID on new API:', cid);
    
    // Make API request to check status
    const response = await fetch(`${API_BASE_URL}/check/${cid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NFT_STORAGE_API_KEY}`
      }
    });
    
    // Parse response
    const responseText = await response.text();
    logDebug('Response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Failed to parse response: ${responseText}`);
    }
    
    // Check for errors
    if (!response.ok) {
      const errorMessage = data?.error?.message || `API error: ${response.status} ${response.statusText}`;
      logDebug('Error response:', data);
      throw new Error(`Failed to get status: ${errorMessage}`);
    }
    
    // Log success
    logDebug('Got status:', data);
    
    return data;
  } catch (error) {
    console.error('Error getting status:', error);
    throw new Error(`Failed to get status: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Test the API connectivity
 * For debugging purposes - tests if the API key works
 */
export const testApiConnection = async (): Promise<{success: boolean, message: string}> => {
  try {
    logDebug('Testing new NFT.Storage API connection with key:', NFT_STORAGE_API_KEY);
    
    // Simple test to list user info
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NFT_STORAGE_API_KEY}`
      }
    });
    
    // Get response text for debugging
    const responseText = await response.text();
    logDebug('Test response text:', responseText);
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      logDebug('Test response parsed:', data);
      
      if (response.ok) {
        return { 
          success: true, 
          message: `API connection successful with user: ${data?.value?.name || 'Unknown'}` 
        };
      } else {
        return { 
          success: false, 
          message: `API error: ${data?.error?.message || response.statusText}` 
        };
      }
    } catch (e) {
      return { 
        success: false, 
        message: `Could not parse response: ${responseText}` 
      };
    }
  } catch (error) {
    console.error('API test error:', error);
    return { 
      success: false, 
      message: `Connection error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

export default {
  createCollection,
  addTokensToCollection,
  uploadFileDirect,
  getDealStatus,
  testApiConnection
}; 