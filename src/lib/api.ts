import axios from 'axios';
import { API_CONFIG, AUTH_CONFIG, BLOCKCHAIN_CONFIG } from './config';
import { toast } from 'sonner';

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Flag to track if we're using mock data
let usingMockData = false;

// Add a request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Mock data for when backend is not available
const mockData = {
  ipnft: {
    getAll: () => ({
      data: {
        success: true,
        data: Array(5).fill(null).map((_, i) => ({
          id: `mock-id-${i + 1}`,
          title: `Mock IP-NFT ${i + 1}`,
          description: `This is a mock IP-NFT for testing purposes #${i + 1}`,
          ip_type: ['Patent', 'Copyright', 'Trademark', 'Trade Secret', 'Patent Application'][i % 5],
          development_stage: ['Discovery', 'Preclinical', 'Phase I', 'Phase II', 'Phase III'][i % 5],
          status: 'active',
          valuation: (1 + i * 0.5).toString(),
          created_at: new Date(Date.now() - i * 86400000).toISOString(),
        })),
        message: 'Mock IP-NFTs retrieved successfully',
      }
    }),
    getById: (id) => ({
      data: {
        success: true,
        data: {
          id,
          title: `Mock IP-NFT ${id}`,
          description: `This is a mock IP-NFT for testing purposes with ID ${id}`,
          ip_type: 'Patent',
          development_stage: 'Discovery',
          status: 'active',
          valuation: '1.0',
          created_at: new Date().toISOString(),
        },
        message: 'Mock IP-NFT retrieved successfully',
      }
    }),
    mint: (formData) => {
      // Create a mock response for minting
      const mockId = `mock-ipnft-${Date.now()}`;
      return {
        data: {
          success: true,
          ipnft: {
            id: mockId,
            name: formData.get('name') || 'Mock IP-NFT',
            description: formData.get('description') || 'Mock description',
            ipType: formData.get('ipType') || 'Patent',
            developmentStage: formData.get('developmentStage') || 'Discovery',
            authors: formData.get('authors') || 'Mock Author',
            institution: formData.get('institution') || '',
            tokenId: mockId,
            contract_address: '0x1234567890abcdef1234567890abcdef12345678',
            owner: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.WALLET_ADDRESS) || '0x0000000000000000000000000000000000000000',
            created_at: new Date().toISOString(),
          },
          message: 'IP-NFT minted successfully',
        }
      };
    },
  },
  auth: {
    getNonce: (address) => ({
      data: {
        success: true,
        data: {
          nonce: `mock-nonce-${Date.now()}`,
          address,
        },
        message: 'Mock nonce generated successfully',
      }
    }),
    verify: (address, signature) => ({
      data: {
        success: true,
        data: {
          token: `mock-token-${Date.now()}`,
          user: {
            id: `mock-user-${Date.now()}`,
            wallet_address: address,
            email: null,
            name: null,
            institution: null,
            role: 'user',
            kyc_status: 'pending',
            terms_accepted: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        message: 'Mock authentication successful',
      }
    }),
    getUser: () => ({
      data: {
        success: true,
        data: {
          id: `mock-user-${Date.now()}`,
          wallet_address: localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.WALLET_ADDRESS) || '0x0000000000000000000000000000000000000000',
          email: null,
          name: null,
          institution: null,
          role: 'user',
          kyc_status: 'pending',
          terms_accepted: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        message: 'Mock user retrieved successfully',
      }
    }),
  },
};

// Function to handle mock data fallback
const handleMockDataFallback = (error: any) => {
  // Only show the mock data warning once
  if (!usingMockData) {
    usingMockData = true;
    console.warn('API is unavailable. Using mock data for development.');
    toast.warning('API is unavailable. Using mock data for development.', {
      duration: 5000,
      id: 'mock-data-warning',
    });
  }
  
  // Try to determine which API endpoint was called
  const url = error.config?.url;
  const method = error.config?.method;
  
  // Check if we have mock data for this endpoint
  if (url && method) {
    // Extract the endpoint path
    const path = url.replace(/^\//, '').split('/');
    
    // Handle auth endpoints
    if (path[0] === 'auth') {
      if (path[1] === 'nonce' && method === 'post') {
        const address = error.config?.data ? JSON.parse(error.config.data).walletAddress : '';
        return Promise.resolve(mockData.auth.getNonce(address));
      } else if (path[1] === 'verify' && method === 'post') {
        const data = error.config?.data ? JSON.parse(error.config.data) : {};
        return Promise.resolve(mockData.auth.verify(data.walletAddress, data.signature));
      } else if (path[1] === 'user' && method === 'get') {
        return Promise.resolve(mockData.auth.getUser());
      }
    }
    
    // Handle ipnft endpoints
    if ((path[0] === 'api' && path[1] === 'ipnft') || path[0] === 'ipnft') {
      if ((path.length === 2 || (path.length === 3 && path[0] === 'api')) && method === 'get') {
        return Promise.resolve(mockData.ipnft.getAll());
      } else if ((path.length === 3 || (path.length === 4 && path[0] === 'api')) && method === 'get') {
        const idIndex = path[0] === 'api' ? 2 : 1;
        return Promise.resolve(mockData.ipnft.getById(path[idIndex]));
      } else if ((path.includes('mint')) && method === 'post') {
        // Handle mint request with mock data
        const formData = new FormData();
        if (error.config?.data) {
          // Try to extract form data from the error config
          try {
            const data = JSON.parse(error.config.data);
            Object.entries(data).forEach(([key, value]) => {
              if (typeof value === 'string' || value instanceof Blob) {
                formData.append(key, value);
              } else if (value !== null && value !== undefined) {
                formData.append(key, String(value));
              }
            });
          } catch (e) {
            console.error('Failed to parse form data:', e);
          }
        }
        return Promise.resolve(mockData.ipnft.mint(formData));
      }
    }
  }
  
  // If we don't have specific mock data for this endpoint, reject with the original error
  return Promise.reject(error);
};

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Reset the mock data flag if we get a successful response
    usingMockData = false;
    
    // Log API response (except for sensitive operations)
    const skipLogging = response.config.url?.includes('/auth/') && response.config.method === 'post';
    if (!skipLogging) {
      console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      
      // Handle specific status codes
      if (error.response.status === 401) {
        // Unauthorized - clear token
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN);
        // Redirect will be handled by ProtectedRoute component
      }
      
      // Return the error for the caller to handle
      return Promise.reject(error);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      
      // Use mock data fallback
      return handleMockDataFallback(error);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      
      // Try mock data fallback for setup errors too
      return handleMockDataFallback(error);
    }
  }
);

// Track ongoing file uploads
const fileUploads = new Map<string, { progress: number, cancel: () => void }>();

// API endpoints
export const api = {
  // Authentication endpoints
  auth: {
    login: (data: { email: string; password: string }) => 
      axiosInstance.post('/auth/login', data),
    register: (data: { email: string; password: string; name: string }) => 
      axiosInstance.post('/auth/register', data),
    verifyToken: () => 
      axiosInstance.get('/auth/verify'),
    logout: () => 
      axiosInstance.post('/auth/logout'),
  },
  
  // IP-NFT endpoints
  ipnft: {
    getAll: (walletAddress?: string) => 
      axiosInstance.get('/ipnft', { params: { walletAddress } }),
    get: (id: string) => 
      axiosInstance.get(`/ipnft/${id}`),
    mint: async (formData: FormData) => {
      try {
        // Continue with the existing implementation...
        return axiosInstance.post('/ipnft/mint', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (error) {
        console.error('Error in mint function:', error);
        throw error;
      }
    },
    getValuation: (id: string) => 
      axiosInstance.get(`/api/ipnft/${id}/valuation`),
  },
  
  // User endpoints
  user: {
    getProfile: () => 
      axiosInstance.get('/user/profile'),
    updateProfile: (data: any) => 
      axiosInstance.put('/user/profile', data),
    getWallet: () => 
      axiosInstance.get('/user/wallet'),
  },
  
  // Marketplace endpoints
  marketplace: {
    getListings: () => 
      axiosInstance.get('/marketplace/listings'),
    getListing: (id: string) => 
      axiosInstance.get(`/marketplace/listings/${id}`),
    createListing: (data: any) => 
      axiosInstance.post('/marketplace/listings', data),
    buyListing: (id: string, data: any) => 
      axiosInstance.post(`/marketplace/listings/${id}/buy`, data),
  },
  
  // Fractionalization endpoints
  fractionalization: {
    getUserFractions: (walletAddress: string) => 
      axiosInstance.get('/fractionalization/user', { params: { walletAddress } }),
    getFraction: (tokenAddress: string) => 
      axiosInstance.get(`/fractionalization/${tokenAddress}`),
    fractionalize: (data: any) => 
      axiosInstance.post('/fractionalization', data),
    getListings: () => 
      axiosInstance.get('/fractionalization/listings'),
    buyFractions: (tokenAddress: string, data: any) => 
      axiosInstance.post(`/fractionalization/${tokenAddress}/buy`, data),
  },
  
  // Analytics endpoints
  analytics: {
    getOverview: () => 
      axiosInstance.get('/analytics/overview'),
    getValuationHistory: (ipnftId: string) => 
      axiosInstance.get(`/analytics/valuation/${ipnftId}`),
    getMarketTrends: () => 
      axiosInstance.get('/analytics/market-trends'),
  },
  
  // Utility to check if we're using mock data
  isMockMode: () => usingMockData,
};

// Export individual API modules for direct imports
export const { auth, ipnft, user, marketplace, fractionalization, analytics } = api;

export default api;
