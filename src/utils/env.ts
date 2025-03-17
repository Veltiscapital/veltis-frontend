/**
 * Environment variable utility
 * 
 * This utility provides a consistent way to access environment variables
 * from both Vite's import.meta.env and the runtime env-config.js
 */

// Define the window.ENV interface
declare global {
  interface Window {
    ENV?: Record<string, string>;
  }
}

/**
 * Get an environment variable
 * 
 * This function tries to get the environment variable from:
 * 1. window.ENV (runtime environment variables)
 * 2. import.meta.env (Vite environment variables)
 * 3. Falls back to the provided default value
 * 
 * @param key The environment variable key
 * @param defaultValue The default value to return if the environment variable is not found
 * @returns The environment variable value or the default value
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  // Try to get from window.ENV (runtime environment variables)
  if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
    return window.ENV[key];
  }
  
  // Try to get from import.meta.env (Vite environment variables)
  // @ts-ignore - Vite's import.meta.env is not typed
  if (import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  
  // Fall back to default value
  return defaultValue;
}

/**
 * Get all environment variables
 * 
 * @returns An object containing all environment variables
 */
export function getAllEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  
  // Add Vite environment variables
  // @ts-ignore
  if (import.meta.env) {
    // @ts-ignore
    Object.keys(import.meta.env).forEach(key => {
      // @ts-ignore
      env[key] = import.meta.env[key];
    });
  }
  
  // Add runtime environment variables (overriding Vite variables if they exist)
  if (typeof window !== 'undefined' && window.ENV) {
    Object.keys(window.ENV).forEach(key => {
      env[key] = window.ENV![key];
    });
  }
  
  return env;
}

/**
 * Check if all required environment variables are set
 * 
 * @param requiredVars An array of required environment variable keys
 * @returns An object with a success flag and an array of missing variables
 */
export function checkRequiredEnv(requiredVars: string[]): { success: boolean; missing: string[] } {
  const missing: string[] = [];
  
  requiredVars.forEach(key => {
    if (!getEnv(key)) {
      missing.push(key);
    }
  });
  
  return {
    success: missing.length === 0,
    missing
  };
}

// Export common environment variables
export const ENV = {
  CLERK_PUBLISHABLE_KEY: getEnv('VITE_CLERK_PUBLISHABLE_KEY'),
  BLOCKCHAIN_NETWORK: getEnv('VITE_BLOCKCHAIN_NETWORK'),
  IP_NFT_REGISTRY_CONTRACT: getEnv('VITE_IP_NFT_REGISTRY_CONTRACT'),
  SIMPLE_IP_NFT_REGISTRY_CONTRACT: getEnv('VITE_SIMPLE_IP_NFT_REGISTRY_CONTRACT'),
  POLYGON_AMOY_RPC_URL: getEnv('VITE_POLYGON_AMOY_RPC_URL'),
  POLYGON_MAINNET_RPC_URL: getEnv('VITE_POLYGON_MAINNET_RPC_URL'),
  CHAIN_ID: getEnv('VITE_CHAIN_ID'),
  NETWORK_NAME: getEnv('VITE_NETWORK_NAME'),
  NFT_STORAGE_API_KEY: getEnv('VITE_NFT_STORAGE_API_KEY'),
  ALCHEMY_API_KEY: getEnv('VITE_ALCHEMY_API_KEY'),
  ALCHEMY_NETWORK: getEnv('VITE_ALCHEMY_NETWORK')
}; 