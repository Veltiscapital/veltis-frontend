import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Use '' as prefix to load all env variables, not just VITE_*
  const env = loadEnv(mode, process.cwd(), '');
  
  // List of required environment variables
  const requiredEnvVars = [
    'VITE_CLERK_PUBLISHABLE_KEY',
    'VITE_NFT_STORAGE_API_KEY',
    'VITE_BLOCKCHAIN_NETWORK',
    'VITE_IP_NFT_REGISTRY_CONTRACT',
    'VITE_SIMPLE_IP_NFT_REGISTRY_CONTRACT',
    'VITE_POLYGON_AMOY_RPC_URL',
    'VITE_POLYGON_MAINNET_RPC_URL',
    'VITE_CHAIN_ID',
    'VITE_NETWORK_NAME'
  ];
  
  // Create define object with all environment variables
  const defineObj: Record<string, any> = { 'process.env': {} };
  
  // Add all environment variables to the define object
  Object.keys(env).forEach(key => {
    defineObj[`import.meta.env.${key}`] = JSON.stringify(env[key] || '');
    defineObj[`process.env.${key}`] = JSON.stringify(env[key] || '');
  });
  
  // Log missing required environment variables in development mode
  if (mode === 'development') {
    requiredEnvVars.forEach(key => {
      if (!env[key]) {
        console.warn(`Warning: Missing required environment variable: ${key}`);
      }
    });
  }
  
  return {
    base: '/',
    define: defineObj,
    server: {
      host: "::",
      port: 3000,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      target: 'es2015',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'web3-vendor': ['ethers', 'nft.storage'],
            'ui-vendor': ['@radix-ui/react-alert-dialog', '@radix-ui/react-dialog', '@radix-ui/react-select']
          }
        },
      },
      // Ensure Vercel can process the build correctly
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
    },
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'react-router-dom', 
        'ethers', 
        'nft.storage',
        '@clerk/clerk-react',
        '@tanstack/react-query'
      ],
      exclude: ['lovable-tagger'],
    },
    // Add specific handling for Vercel environment
    envPrefix: ['VITE_'],
  };
});

