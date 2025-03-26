import { ApiResponse } from '@/hooks/use-api';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data as ApiResponse<T>;
}

// Generic fetch function with authentication
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  
  // Get auth token from localStorage
  const token = localStorage.getItem('veltis_token');
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const config: RequestInit = {
    ...options,
    headers,
  };
  
  try {
    // For demo purposes, we'll simulate API calls with mock data
    console.log(`API call to ${url} with options:`, config);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock response based on the endpoint
    let mockResponse: ApiResponse<any> = {
      success: true,
      data: { message: 'Mock API response' },
    };
    
    // Return mock data
    return mockResponse as ApiResponse<T>;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

// API endpoints
export const api = {
  // User endpoints
  user: {
    getProfile: () => fetchWithAuth<{ id: string; name: string; email: string }>('/user'),
    updateProfile: (data: any) => fetchWithAuth<{ success: boolean }>('/user', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  },
  
  // IP-NFT endpoints
  ipnft: {
    getAll: () => fetchWithAuth<any[]>('/ipnft'),
    getById: (id: string) => fetchWithAuth<any>(`/ipnft/${id}`),
    mint: (data: any) => fetchWithAuth<any>('/ipnft/mint', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  
  // Marketplace endpoints
  marketplace: {
    getListings: () => fetchWithAuth<any[]>('/market/listings'),
    createListing: (data: any) => fetchWithAuth<any>('/market/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  
  // Fractionalization endpoints
  fractionalization: {
    fractionalize: (data: any) => fetchWithAuth<any>('/fractionalization', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getFractions: (address: string) => fetchWithAuth<any>(`/fractionalization/${address}`),
  },
};

// Export ipnft directly for import convenience
export const ipnft = api.ipnft;
