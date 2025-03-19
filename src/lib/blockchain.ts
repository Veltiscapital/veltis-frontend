import { ethers } from 'ethers';
import { BLOCKCHAIN_CONFIG } from './config';

// Network configurations
export const NETWORKS = {
  ethereum: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  polygon: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  mumbai: {
    chainId: '0x13881',
    chainName: 'Polygon Mumbai Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  },
  hardhat: {
    chainId: '0x7A69',
    chainName: 'Hardhat Local',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrls: [],
  },
};

// Contract ABIs (simplified for demonstration)
const IPNFT_ABI = [
  'function approve(address to, uint256 tokenId) external',
  'function transferFrom(address from, address to, uint256 tokenId) external',
  'function mint(string metadataUri) external returns (uint256)',
];

const FRACTIONALIZATION_FACTORY_ABI = [
  'function fractionalize(uint256 tokenId, uint256 fractions) external returns (address)',
];

// Get provider
export function getProvider(): ethers.providers.Web3Provider | null {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }
  return new ethers.providers.Web3Provider(window.ethereum);
}

// Get signer
export function getSigner(): ethers.Signer | null {
  const provider = getProvider();
  if (!provider) return null;
  return provider.getSigner();
}

// Get address
export async function getAddress(): Promise<string> {
  const signer = getSigner();
  if (!signer) throw new Error('No signer available');
  return await signer.getAddress();
}

// Connect wallet
export async function connectWallet(providerType: 'metamask' | 'coinbase' = 'metamask'): Promise<void> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
  }
  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log('Wallet connected successfully');
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
}

// Disconnect wallet
export async function disconnectWallet(): Promise<void> {
  console.log('Wallet disconnected');
}

// Switch network
export async function switchNetwork(networkName: keyof typeof NETWORKS): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum provider found');
  }
  const network = NETWORKS[networkName];
  if (!network) {
    throw new Error(`Network ${networkName} not supported`);
  }
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId }],
    });
    return true;
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: network.chainId,
              chainName: network.chainName,
              nativeCurrency: network.nativeCurrency,
              rpcUrls: network.rpcUrls,
              blockExplorerUrls: network.blockExplorerUrls,
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding network:', addError);
        return false;
      }
    }
    console.error('Error switching network:', error);
    return false;
  }
}

// Get owned IP-NFTs
export async function getOwnedIPNFTs(): Promise<any[]> {
  const signer = getSigner();
  if (!signer) throw new Error('No signer available');
  const address = await signer.getAddress();
  // For demo purposes, return mock data
  return [
    {
      id: '101',
      name: 'Gene Therapy Patent',
      description: 'Novel gene therapy approach for rare genetic disorders',
      ipType: 'Patent',
      owner: address,
      valuation: '5000000',
      uri: 'ipfs://QmXyZ123456789abcdef/metadata.json',
      createdAt: new Date().toISOString(),
    },
    {
      id: '102',
      name: 'Biomarker Discovery Platform',
      description: 'AI-powered platform for discovering novel biomarkers in complex diseases',
      ipType: 'Software',
      owner: address,
      valuation: '3500000',
      uri: 'ipfs://QmAbcdef123456789xyz/metadata.json',
      createdAt: new Date().toISOString(),
    },
  ];
}

// Approve IPNFT transfer
export async function approveIPNFTTransfer(tokenId: string): Promise<boolean> {
  const signer = getSigner();
  if (!signer) throw new Error('No signer available');
  const contractAddress = BLOCKCHAIN_CONFIG.CONTRACTS.IP_NFT_REGISTRY;
  const contract = new ethers.Contract(contractAddress, IPNFT_ABI, signer);
  try {
    const tx = await contract.approve(BLOCKCHAIN_CONFIG.CONTRACTS.FRACTIONALIZATION_FACTORY, tokenId);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error approving IPNFT transfer:', error);
    return false;
  }
}

// Fractionalize IPNFT
export async function fractionalizeIPNFT(tokenId: string, fractions: number): Promise<string> {
  const signer = getSigner();
  if (!signer) throw new Error('No signer available');
  const factoryContract = getFractionalizationFactoryContract();
  try {
    const tx = await factoryContract.fractionalize(tokenId, fractions);
    const receipt = await tx.wait();
    // For demo purposes, return a mock fractional token contract address
    return '0xFractionalTokenContractAddress';
  } catch (error) {
    console.error('Error fractionalizing IPNFT:', error);
    throw error;
  }
}

// Get Fractionalization Factory Contract
export function getFractionalizationFactoryContract(): ethers.Contract {
  const signer = getSigner();
  if (!signer) throw new Error('No signer available');
  const address = BLOCKCHAIN_CONFIG.CONTRACTS.FRACTIONALIZATION_FACTORY;
  return new ethers.Contract(address, FRACTIONALIZATION_FACTORY_ABI, signer);
}

// Create and Fractionalize
export async function createAndFractionalize(metadataUri: string, fractions: number): Promise<string> {
  // Mock implementation
  console.log('Creating and fractionalizing IPNFT with metadata URI:', metadataUri);
  // For demo purposes, return a mock fractional token contract address
  return '0xFractionalTokenContractAddress';
}

// Format Address
export function formatAddress(address: string): string {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

// Check if IPNFT is Fractionalized
export async function isIPNFTFractionalized(tokenId: string): Promise<boolean> {
  // Mock implementation
  console.log(`Checking if IPNFT tokenId: ${tokenId} is fractionalized`);
  return false;
}

// Transfer IPNFT
export async function transferIPNFT(tokenId: string, toAddress: string): Promise<boolean> {
  const signer = getSigner();
  if (!signer) throw new Error('No signer available');
  const contractAddress = BLOCKCHAIN_CONFIG.CONTRACTS.IP_NFT_REGISTRY;
  const contract = new ethers.Contract(contractAddress, IPNFT_ABI, signer);
  try {
    const tx = await contract.transferFrom(await signer.getAddress(), toAddress, tokenId);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error transferring IPNFT:', error);
    return false;
  }
}

// Format Ether amount
export function formatEth(amount: string): string {
  return ethers.utils.formatEther(amount) + ' ETH';
}

// Mint Simple IPNFT
export async function mintSimpleIPNFT(metadataUri: string): Promise<string> {
  const signer = getSigner();
  if (!signer) throw new Error('No signer available');
  const contractAddress = BLOCKCHAIN_CONFIG.CONTRACTS.SIMPLE_IP_NFT_REGISTRY;
  const contract = new ethers.Contract(contractAddress, IPNFT_ABI, signer);
  try {
    const tx = await contract.mint(metadataUri);
    const receipt = await tx.wait();
    // For demo purposes, return a mock token ID
    return '1';
  } catch (error) {
    console.error('Error minting Simple IPNFT:', error);
    throw error;
  }
}

// Functions are already exported in-place, no need for re-exporting
