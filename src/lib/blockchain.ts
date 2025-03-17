import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { BLOCKCHAIN_CONFIG } from './config';
import { toast } from 'sonner';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

// Network configurations
export const NETWORKS = {
  'polygon-mainnet': {
    chainId: '0x89', // 137 in decimal
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [BLOCKCHAIN_CONFIG.RPC_URLS['polygon-mainnet']],
    blockExplorerUrls: [BLOCKCHAIN_CONFIG.EXPLORER_URLS['polygon-mainnet']],
  },
  'polygon-amoy': {
    chainId: '0x13882', // 80002 in decimal
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'POL',
      decimals: 18,
    },
    rpcUrls: [BLOCKCHAIN_CONFIG.RPC_URLS['polygon-amoy']],
    blockExplorerUrls: [BLOCKCHAIN_CONFIG.EXPLORER_URLS['polygon-amoy']],
  },
};

// ABI for the IP-NFT Registry contract with fees
const IP_NFT_REGISTRY_ABI = [
  // Events
  "event IPNFTMinted(uint256 indexed tokenId, address indexed owner, string title, uint256 valuation, uint256 fee)",
  "event IPNFTTransferred(uint256 indexed tokenId, address indexed from, address indexed to)",
  "event IPNFTValuationUpdated(uint256 indexed tokenId, uint256 newValuation)",
  "event TransferFeePaid(uint256 tokenId, address from, address to, uint256 platformFee, uint256 royaltyAmount)",
  
  // View functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function getIPNFT(uint256 tokenId) view returns (tuple(uint256 id, string name, string description, string ipType, address owner, uint256 valuation, string uri, uint256 createdAt))",
  "function getIPNFTsByOwner(address owner) view returns (uint256[])",
  "function getValuation(uint256 tokenId) view returns (uint256)",
  "function calculateMintFee(uint256 valuation) view returns (uint256)",
  "function calculateTransferFee(uint256 tokenId) view returns (uint256 platformFee, uint256 royaltyAmount)",
  "function mintFeePercentage() view returns (uint256)",
  "function transferFeePercentage() view returns (uint256)",
  
  // Transaction functions
  "function mintIP(address recipient, string tokenURI, string title, string authors, string institution, uint256 filingDate, uint256 expirationDate, string ipfsDocumentCID, string ipType, string developmentStage, string digitalFingerprint, address royaltyRecipient, uint256 royaltyPercentage, uint256 valuation) payable returns (uint256)",
  "function transferWithFee(uint256 tokenId, address to) payable",
  "function updateValuation(uint256 tokenId, uint256 newValuation)",
];

// ABI for the Simple IP-NFT Registry contract
const SIMPLE_IP_NFT_REGISTRY_ABI = [
  // Events
  "event IPNFTMinted(uint256 tokenId, address owner, string title, uint256 valuation, uint256 fee)",
  
  // View functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function getValuation(uint256 tokenId) view returns (uint256)",
  "function calculateMintFee(uint256 valuation) view returns (uint256)",
  "function mintFeePercentage() view returns (uint256)",
  "function feeCollector() view returns (address)",
  
  // Transaction functions
  "function mintIP(address recipient, string memory tokenURI, string memory title, string memory authors, string memory institution, uint256 filingDate, string memory ipfsDocumentCID, string memory ipType, uint256 valuation) payable returns (uint256)",
  "function setMintFeePercentage(uint256 percentage)",
  "function setFeeCollector(address collector)",
  "function grantMinterRole(address minter)",
];

// ABI for the fractionalization factory contract
const FRACTIONALIZATION_FACTORY_ABI = [
  // View functions
  "function userFractionalizations(address user, uint256 index) view returns (address tokenContract, address ipnftContract, uint256 ipnftTokenId, address owner, string name, string symbol, uint256 createdAt)",
  "function getUserFractionalizations(address user) view returns (tuple(address tokenContract, address ipnftContract, uint256 ipnftTokenId, address owner, string name, string symbol, uint256 createdAt)[])",
  "function ipnftToFractionalization(address ipnftContract, uint256 ipnftTokenId) view returns (address)",
  "function getTotalFractionalizations() view returns (uint256)",
  "function feeCollector() view returns (address)",
  "function creationFeePercentage() view returns (uint256)",
  
  // Transaction functions
  "function createFractionalization(string name, string symbol, address ipnftContract, uint256 ipnftTokenId, uint256 totalShares, uint256 initialPrice) payable returns (address)",
];

// ABI for the fractionalization token contract
const FRACTIONALIZATION_TOKEN_ABI = [
  // View functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function getFractionalizationInfo() view returns (address nftContract, uint256 tokenId, address owner, uint256 created, uint256 shares, uint256 price, bool canRedeem, uint256 redeemPrice)",
  "function ipnftContract() view returns (address)",
  "function ipnftTokenId() view returns (uint256)",
  "function originalOwner() view returns (address)",
  "function totalShares() view returns (uint256)",
  "function initialPrice() view returns (uint256)",
  "function redemptionEnabled() view returns (bool)",
  "function redemptionPrice() view returns (uint256)",
  
  // Transaction functions
  "function buyTokens(uint256 tokenAmount) payable",
  "function sellTokens(uint256 tokenAmount)",
  "function enableRedemption(uint256 redemptionPrice)",
  "function redeemIPNFT()",
];

// Web3Modal instance
let web3Modal: Web3Modal;

// Provider and signer
let provider: ethers.providers.Web3Provider | null = null;
let signer: ethers.Signer | null = null;

// Initialize Web3Modal with providers
export const initWeb3Modal = () => {
  const providerOptions = {
    coinbasewallet: {
      package: CoinbaseWalletSDK,
      options: {
        appName: "Veltis Platform",
        infuraId: import.meta.env.VITE_INFURA_ID || "",
        rpc: {
          137: BLOCKCHAIN_CONFIG.RPC_URLS['polygon-mainnet'],
          80002: BLOCKCHAIN_CONFIG.RPC_URLS['polygon-amoy'],
        },
        chainId: BLOCKCHAIN_CONFIG.NETWORK === 'polygon-mainnet' ? 137 : 80002,
      }
    }
  };

  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
    theme: "dark",
  });
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Connect wallet
export const connectWallet = async (walletType: 'metamask' | 'coinbase' = 'metamask') => {
  try {
    // Clear any existing provider
    if (provider) {
      provider = null;
      signer = null;
    }
    
    let web3Provider;
    
    if (walletType === 'coinbase') {
      // Connect with Coinbase Wallet
      const instance = await web3Modal.connectTo('coinbasewallet');
      web3Provider = new ethers.providers.Web3Provider(instance);
    } else {
      // Default to MetaMask or other injected providers
      const instance = await web3Modal.connect();
      web3Provider = new ethers.providers.Web3Provider(instance);
    }
    
    // Get the connected network
    const network = await web3Provider.getNetwork();
    const chainId = network.chainId;
    
    // Check if we're on the correct network
    const targetNetwork = BLOCKCHAIN_CONFIG.NETWORK;
    const targetChainId = BLOCKCHAIN_CONFIG.CHAIN_IDS[targetNetwork];
    
    let networkName = 'unknown';
    
    // Find the network name from chainId
    for (const [name, config] of Object.entries(NETWORKS)) {
      const configChainId = parseInt(config.chainId, 16);
      if (configChainId === chainId) {
        networkName = name;
        break;
      }
    }
    
    // If not on the correct network, prompt to switch
    if (chainId !== targetChainId) {
      const shouldSwitch = window.confirm(`You are connected to ${networkName}. Would you like to switch to ${targetNetwork}?`);
      if (shouldSwitch) {
        await switchNetwork(targetNetwork as keyof typeof NETWORKS);
        // Refresh the provider after network switch
        web3Provider = new ethers.providers.Web3Provider(await web3Modal.connect());
      }
    }
    
    // Set the global provider and signer
    provider = web3Provider;
    signer = web3Provider.getSigner();
    
    // Get the address
    const address = await signer.getAddress();
    
    return {
      address,
      chainId,
      network: networkName,
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

/**
 * Disconnect wallet
 */
export const disconnectWallet = async () => {
  try {
    const modal = initWeb3Modal();
    if (modal) {
      await modal.clearCachedProvider();
      localStorage.removeItem('walletConnected');
      toast.success('Wallet disconnected');
    }
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    toast.error('Failed to disconnect wallet');
  }
};

/**
 * Switch to a different network
 */
export const switchNetwork = async (networkName: keyof typeof NETWORKS) => {
  try {
    if (!window.ethereum) throw new Error('No Ethereum provider found');
    
    const networkConfig = NETWORKS[networkName];
    if (!networkConfig) throw new Error(`Network configuration not found for ${networkName}`);
    
    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainId }],
      });
      
      toast.success(`Switched to ${networkConfig.chainName}`);
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          // Try to add the network
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
          
          toast.success(`Added and switched to ${networkConfig.chainName}`);
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast.error(`Failed to add ${networkConfig.chainName}`);
          throw addError;
        }
      } else {
        console.error('Error switching network:', switchError);
        toast.error(`Failed to switch to ${networkConfig.chainName}`);
        throw switchError;
      }
    }
  } catch (error) {
    console.error('Error in switchNetwork:', error);
    throw error;
  }
};

/**
 * Get a Web3 provider
 */
export const getProvider = () => {
  // Check if window.ethereum is available (MetaMask)
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  
  // Fallback to RPC URL
  const network = BLOCKCHAIN_CONFIG.NETWORK;
  const rpcUrl = BLOCKCHAIN_CONFIG.RPC_URLS[network as keyof typeof BLOCKCHAIN_CONFIG.RPC_URLS];
  return new ethers.providers.JsonRpcProvider(rpcUrl);
};

/**
 * Get a signer for transactions
 */
export const getSigner = async () => {
  const provider = getProvider();
  
  // If using MetaMask, request accounts
  if (window.ethereum) {
    await provider.send('eth_requestAccounts', []);
  }
  
  return provider.getSigner();
};

/**
 * Get the IP-NFT Registry contract instance
 * @param withSigner Whether to connect the contract with a signer for transactions
 */
export const getIPNFTRegistryContract = async (withSigner = false) => {
  const contractAddress = BLOCKCHAIN_CONFIG.CONTRACTS.IP_NFT_REGISTRY;
  
  if (!contractAddress) {
    throw new Error('IP-NFT Registry contract address not configured');
  }
  
  if (withSigner) {
    const signer = await getSigner();
    return new ethers.Contract(contractAddress, IP_NFT_REGISTRY_ABI, signer);
  }
  
  const provider = getProvider();
  return new ethers.Contract(contractAddress, IP_NFT_REGISTRY_ABI, provider);
};

/**
 * Get the Simple IP-NFT Registry contract instance
 * @param withSigner Whether to connect the contract with a signer for transactions
 */
export const getSimpleIPNFTRegistryContract = async (withSigner = false) => {
  const contractAddress = BLOCKCHAIN_CONFIG.CONTRACTS.SIMPLE_IP_NFT_REGISTRY;
  
  if (!contractAddress) {
    throw new Error('Simple IP-NFT Registry contract address not configured');
  }
  
  if (withSigner) {
    const signer = await getSigner();
    return new ethers.Contract(contractAddress, SIMPLE_IP_NFT_REGISTRY_ABI, signer);
  }
  
  const provider = getProvider();
  return new ethers.Contract(contractAddress, SIMPLE_IP_NFT_REGISTRY_ABI, provider);
};

/**
 * Calculate the mint fee for a given valuation
 * @param valuation The valuation amount in wei
 * @param useSimpleContract Whether to use the SimpleIPNFTRegistry contract
 * @returns The mint fee in wei
 */
export const calculateMintFee = async (valuation: ethers.BigNumberish, useSimpleContract = false) => {
  try {
    const contract = useSimpleContract 
      ? await getSimpleIPNFTRegistryContract() 
      : await getIPNFTRegistryContract();
    return await contract.calculateMintFee(valuation);
  } catch (error) {
    console.error('Error calculating mint fee:', error);
    throw error;
  }
};

/**
 * Calculate the transfer fee for a given token
 * @param tokenId The ID of the token
 * @returns The platform fee and royalty amount in wei
 */
export const calculateTransferFee = async (tokenId: string) => {
  try {
    const contract = await getIPNFTRegistryContract();
    return await contract.calculateTransferFee(tokenId);
  } catch (error) {
    console.error('Error calculating transfer fee:', error);
    throw error;
  }
};

/**
 * Mint a new IP-NFT with fee
 * @param recipient The recipient of the IP-NFT
 * @param tokenURI The URI of the token metadata
 * @param title The title of the IP
 * @param authors The authors of the IP
 * @param institution The institution of the IP
 * @param filingDate The filing date of the IP
 * @param expirationDate The expiration date of the IP
 * @param ipfsDocumentCID The IPFS CID of the IP document
 * @param ipType The type of IP (Patent, Copyright, etc.)
 * @param developmentStage The development stage of the IP
 * @param digitalFingerprint Hash of the document for verification
 * @param royaltyRecipient The recipient of royalties
 * @param royaltyPercentage The percentage of royalties (in basis points, e.g. 250 = 2.5%)
 * @param valuation The valuation of the IP in wei
 */
export const mintIPNFT = async (
  recipient: string,
  tokenURI: string,
  title: string,
  authors: string,
  institution: string,
  filingDate: number,
  expirationDate: number,
  ipfsDocumentCID: string,
  ipType: string,
  developmentStage: string,
  digitalFingerprint: string,
  royaltyRecipient: string,
  royaltyPercentage: number,
  valuation: ethers.BigNumberish
) => {
  try {
    const contract = await getIPNFTRegistryContract(true);
    
    // Calculate the required fee
    const mintFee = await calculateMintFee(valuation);
    
    // Notify user about the fee
    toast.info(`Minting fee: ${formatEth(mintFee)} MATIC (3% of valuation)`);
    
    // Estimate gas for the transaction
    const gasEstimate = await contract.estimateGas.mintIP(
      recipient,
      tokenURI,
      title,
      authors,
      institution,
      filingDate,
      expirationDate,
      ipfsDocumentCID,
      ipType,
      developmentStage,
      digitalFingerprint,
      royaltyRecipient,
      royaltyPercentage,
      valuation,
      { value: mintFee }
    );
    
    // Add 20% buffer to gas estimate
    const gasLimit = gasEstimate.mul(120).div(100);
    
    // Notify user that transaction is being sent
    toast.info("Sending transaction to the blockchain. Please confirm in your wallet.");
    
    // Send the transaction
    const tx = await contract.mintIP(
      recipient,
      tokenURI,
      title,
      authors,
      institution,
      filingDate,
      expirationDate,
      ipfsDocumentCID,
      ipType,
      developmentStage,
      digitalFingerprint,
      royaltyRecipient,
      royaltyPercentage,
      valuation,
      {
        value: mintFee,
        gasLimit,
      }
    );
    
    toast.info("Transaction submitted. Waiting for confirmation...", {
      id: tx.hash,
      duration: 10000,
    });
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    // Find the IPNFTMinted event in the logs
    const mintEvent = receipt.events?.find(
      (event: any) => event.event === 'IPNFTMinted'
    );
    
    // Extract the token ID from the event
    const tokenId = mintEvent?.args?.tokenId.toString();
    
    // Update the toast
    toast.success("Transaction confirmed! Your IP-NFT has been minted successfully.", { id: tx.hash });
    
    return {
      transactionHash: receipt.transactionHash,
      tokenId,
      blockNumber: receipt.blockNumber,
      valuation: valuation.toString(),
      fee: mintFee.toString(),
    };
  } catch (error) {
    console.error('Error minting IP-NFT:', error);
    
    // User rejected transaction
    if ((error as any).code === 4001) {
      toast.error('Transaction rejected. Please approve the transaction to mint your IP-NFT.');
    } else {
      toast.error('Failed to mint IP-NFT. Please try again later.');
    }
    
    throw error;
  }
};

/**
 * Mint a new IP-NFT using the SimpleIPNFTRegistry contract
 * @param recipient The recipient of the IP-NFT
 * @param tokenURI The URI of the token metadata
 * @param title The title of the IP
 * @param authors The authors of the IP
 * @param institution The institution of the IP
 * @param filingDate The filing date of the IP
 * @param ipfsDocumentCID The IPFS CID of the IP document
 * @param ipType The type of IP (Patent, Copyright, etc.)
 * @param valuation The valuation of the IP in wei
 */
export const mintSimpleIPNFT = async (
  recipient: string,
  tokenURI: string,
  title: string,
  authors: string,
  institution: string,
  filingDate: number,
  ipfsDocumentCID: string,
  ipType: string,
  valuation: ethers.BigNumberish
) => {
  try {
    const contract = await getSimpleIPNFTRegistryContract(true);
    
    // Calculate the required fee
    const mintFee = await calculateMintFee(valuation, true);
    
    // Notify user about the fee
    toast.info(`Minting fee: ${formatEth(mintFee)} MATIC (3% of valuation)`);
    
    // Estimate gas for the transaction
    const gasEstimate = await contract.estimateGas.mintIP(
      recipient,
      tokenURI,
      title,
      authors,
      institution,
      filingDate,
      ipfsDocumentCID,
      ipType,
      valuation,
      { value: mintFee }
    );
    
    // Add 20% buffer to gas estimate
    const gasLimit = gasEstimate.mul(120).div(100);
    
    // Notify user that transaction is being sent
    toast.info("Sending transaction to the blockchain. Please confirm in your wallet.");
    
    // Send the transaction
    const tx = await contract.mintIP(
      recipient,
      tokenURI,
      title,
      authors,
      institution,
      filingDate,
      ipfsDocumentCID,
      ipType,
      valuation,
      {
        value: mintFee,
        gasLimit,
      }
    );
    
    toast.info("Transaction submitted. Waiting for confirmation...", {
      id: tx.hash,
      duration: 10000,
    });
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    // Find the IPNFTMinted event in the logs
    const mintEvent = receipt.events?.find(
      (event: any) => event.event === 'IPNFTMinted'
    );
    
    // Extract the token ID from the event
    const tokenId = mintEvent?.args?.tokenId.toString();
    
    // Update the toast
    toast.success("Transaction confirmed! Your IP-NFT has been minted successfully.", { id: tx.hash });
    
    return {
      transactionHash: receipt.transactionHash,
      tokenId,
      blockNumber: receipt.blockNumber,
      valuation: valuation.toString(),
      fee: mintFee.toString(),
    };
  } catch (error) {
    console.error('Error minting Simple IP-NFT:', error);
    
    // User rejected transaction
    if ((error as any).code === 4001) {
      toast.error('Transaction rejected. Please approve the transaction to mint your IP-NFT.');
    } else {
      toast.error('Failed to mint IP-NFT. Please try again later.');
    }
    
    throw error;
  }
};

/**
 * Transfer an IP-NFT with fee
 * @param tokenId The ID of the token to transfer
 * @param to The recipient address
 */
export const transferIPNFT = async (tokenId: string, to: string) => {
  try {
    const contract = await getIPNFTRegistryContract(true);
    
    // Calculate the required fee
    const [platformFee, royaltyAmount] = await calculateTransferFee(tokenId);
    const totalFee = platformFee.add(royaltyAmount);
    
    // Notify user about the fee
    toast.info(`Transfer fee: ${formatEth(platformFee)} MATIC (platform) + ${formatEth(royaltyAmount)} MATIC (royalty)`);
    
    // Estimate gas for the transaction
    const gasEstimate = await contract.estimateGas.transferWithFee(tokenId, to, { value: totalFee });
    
    // Add 20% buffer to gas estimate
    const gasLimit = gasEstimate.mul(120).div(100);
    
    // Notify user that transaction is being sent
    toast.info("Sending transaction to the blockchain. Please confirm in your wallet.");
    
    // Send the transaction
    const tx = await contract.transferWithFee(tokenId, to, {
      value: totalFee,
      gasLimit,
    });
    
    toast.info("Transaction submitted. Waiting for confirmation...", {
      id: tx.hash,
      duration: 10000,
    });
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    // Find the TransferFeePaid event in the logs
    const transferEvent = receipt.events?.find(
      (event: any) => event.event === 'TransferFeePaid'
    );
    
    // Update the toast
    toast.success("Transfer confirmed!", { id: tx.hash });
    
    return {
      transactionHash: receipt.transactionHash,
      tokenId,
      to,
      platformFee: platformFee.toString(),
      royaltyAmount: royaltyAmount.toString(),
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Error transferring IP-NFT:', error);
    
    // User rejected transaction
    if ((error as any).code === 4001) {
      toast.error('Transaction rejected. Please approve the transaction to transfer your IP-NFT.');
    } else {
      toast.error('Failed to transfer IP-NFT. Please try again later.');
    }
    
    throw error;
  }
};

/**
 * Get transaction URL for block explorer
 * @param txHash Transaction hash
 */
export const getTransactionUrl = (txHash: string) => {
  const network = BLOCKCHAIN_CONFIG.NETWORK;
  const explorerUrl = BLOCKCHAIN_CONFIG.EXPLORER_URLS[network as keyof typeof BLOCKCHAIN_CONFIG.EXPLORER_URLS];
  return `${explorerUrl}/tx/${txHash}`;
};

/**
 * Get address URL for block explorer
 * @param address Ethereum address
 */
export const getAddressUrl = (address: string) => {
  const network = BLOCKCHAIN_CONFIG.NETWORK;
  const explorerUrl = BLOCKCHAIN_CONFIG.EXPLORER_URLS[network as keyof typeof BLOCKCHAIN_CONFIG.EXPLORER_URLS];
  return `${explorerUrl}/address/${address}`;
};

/**
 * Format address for display (0x1234...5678)
 * @param address Ethereum address
 * @param chars Number of characters to show at start and end
 */
export const formatAddress = (address: string, chars = 4) => {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
};

/**
 * Format ETH value with specified decimals
 * @param value Value in wei
 * @param decimals Number of decimals to display
 */
export const formatEth = (value: ethers.BigNumberish, decimals = 4) => {
  const formatted = ethers.utils.formatEther(value);
  const parts = formatted.split('.');
  if (parts.length === 1) return formatted;
  return `${parts[0]}.${parts[1].substring(0, decimals)}`;
};

/**
 * Check if wallet is connected
 */
export const isWalletConnected = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('walletConnected') === 'true';
};

/**
 * Get all IP-NFTs owned by the connected wallet
 */
export const getOwnedIPNFTs = async () => {
  try {
    const contract = await getIPNFTRegistryContract();
    const signer = await getSigner();
    const address = await signer.getAddress();
    
    // Get token IDs owned by the address
    const tokenIds = await contract.getIPNFTsByOwner(address);
    
    // Get details for each token
    const ipnfts = await Promise.all(
      tokenIds.map(async (tokenId: ethers.BigNumber) => {
        const ipnft = await contract.getIPNFT(tokenId);
        const tokenURI = await contract.tokenURI(tokenId);
        
        return {
          id: tokenId.toString(),
          name: ipnft.name,
          description: ipnft.description,
          ipType: ipnft.ipType,
          owner: ipnft.owner,
          valuation: ipnft.valuation.toString(),
          uri: tokenURI,
          createdAt: new Date(ipnft.createdAt.toNumber() * 1000).toISOString(),
        };
      })
    );
    
    return ipnfts;
  } catch (error) {
    console.error('Error getting owned IP-NFTs:', error);
    throw error;
  }
};

/**
 * Get an instance of the fractionalization factory contract
 * @param needsSigner Whether the contract instance requires a signer for transactions
 * @returns A contract instance
 */
export const getFractionalizationFactoryContract = async (needsSigner = false) => {
  const provider = await getProvider();
  
  if (needsSigner) {
    const signer = await getSigner();
    return new ethers.Contract(BLOCKCHAIN_CONFIG.CONTRACTS.FRACTIONALIZATION_FACTORY, FRACTIONALIZATION_FACTORY_ABI, signer);
  }
  
  return new ethers.Contract(BLOCKCHAIN_CONFIG.CONTRACTS.FRACTIONALIZATION_FACTORY, FRACTIONALIZATION_FACTORY_ABI, provider);
};

/**
 * Get an instance of a fractionalization token contract
 * @param contractAddress The address of the fractionalization token contract
 * @param needsSigner Whether the contract instance requires a signer for transactions
 * @returns A contract instance
 */
export const getFractionalizationTokenContract = async (contractAddress: string, needsSigner = false) => {
  const provider = await getProvider();
  
  if (needsSigner) {
    const signer = await getSigner();
    return new ethers.Contract(contractAddress, FRACTIONALIZATION_TOKEN_ABI, signer);
  }
  
  return new ethers.Contract(contractAddress, FRACTIONALIZATION_TOKEN_ABI, provider);
};

/**
 * Get all fractionalized tokens created by a user
 * @param userAddress The user's wallet address
 * @returns Array of fractionalization information
 */
export const getUserFractionalizations = async (userAddress: string) => {
  try {
    const factory = await getFractionalizationFactoryContract();
    const tokenInfo = await factory.getUserFractionalizations(userAddress);
    
    return tokenInfo.map((info: any) => ({
      address: info.tokenContract,
      ipnftContract: info.ipnftContract,
      ipnftTokenId: info.ipnftTokenId.toString(),
      owner: info.owner,
      name: info.name,
      symbol: info.symbol,
      created: new Date(info.createdAt.toNumber() * 1000).toISOString(),
    }));
  } catch (error) {
    console.error('Error getting user fractionalizations:', error);
    return [];
  }
};

/**
 * Check if an IPNFT is already fractionalized
 * @param ipnftContractAddress The IPNFT contract address
 * @param tokenId The IPNFT token ID
 * @returns The fractionalization contract address if fractionalized, null otherwise
 */
export const isIPNFTFractionalized = async (ipnftContractAddress: string, tokenId: string) => {
  try {
    const factory = await getFractionalizationFactoryContract();
    const fractionAddress = await factory.ipnftToFractionalization(
      ipnftContractAddress,
      tokenId
    );
    
    return fractionAddress !== ethers.constants.AddressZero ? fractionAddress : null;
  } catch (error) {
    console.error('Error checking if IPNFT is fractionalized:', error);
    return null;
  }
};

/**
 * Get details of a fractionalization token
 * @param fractionAddress The fractionalization token contract address
 * @returns Fractionalization details
 */
export const getFractionalizationDetails = async (fractionAddress: string) => {
  try {
    const contract = await getFractionalizationTokenContract(fractionAddress);
    const info = await contract.getFractionalizationInfo();
    const [totalSupply, name, symbol] = await Promise.all([
      contract.totalSupply(),
      contract.name(),
      contract.symbol(),
    ]);
    
    return {
      name,
      symbol,
      totalSupply: totalSupply.toString(),
      ipnftContract: info.nftContract,
      ipnftTokenId: info.tokenId.toString(),
      owner: info.owner,
      createdAt: new Date(info.created.toNumber() * 1000).toISOString(),
      totalShares: info.shares.toString(),
      price: info.price.toString(),
      canRedeem: info.canRedeem,
      redemptionPrice: info.redeemPrice.toString(),
    };
  } catch (error) {
    console.error('Error getting fractionalization details:', error);
    throw error;
  }
};

/**
 * Fractionalize an IPNFT
 * @param ipnftContractAddress The IPNFT contract address
 * @param tokenId The IPNFT token ID
 * @param name The name of the fractionalization token
 * @param symbol The symbol of the fractionalization token
 * @param totalShares The total number of shares to create
 * @param initialPrice The initial price per share in wei
 * @returns Transaction details
 */
export const fractionalizeIPNFT = async (
  ipnftContractAddress: string,
  tokenId: string,
  name: string,
  symbol: string,
  totalShares: string,
  initialPrice: ethers.BigNumberish
) => {
  try {
    // Check if IPNFT is already fractionalized
    const existingFraction = await isIPNFTFractionalized(ipnftContractAddress, tokenId);
    if (existingFraction) {
      throw new Error('This IPNFT is already fractionalized');
    }
    
    // Check if user owns the IPNFT
    const ipnftContract = await getIPNFTRegistryContract();
    const owner = await ipnftContract.ownerOf(tokenId);
    const address = await getAddress();
    
    if (owner.toLowerCase() !== address.toLowerCase()) {
      throw new Error('You do not own this IPNFT');
    }
    
    // Get the factory contract
    const factory = await getFractionalizationFactoryContract(true);
    
    // Calculate creation fee (3% of total valuation)
    const totalValuation = ethers.BigNumber.from(totalShares).mul(initialPrice);
    const feePercentage = await factory.creationFeePercentage();
    const creationFee = totalValuation.mul(feePercentage).div(10000);
    
    // Approve the factory contract to transfer the IPNFT
    await approveIPNFTTransfer(ipnftContractAddress, BLOCKCHAIN_CONFIG.CONTRACTS.FRACTIONALIZATION_FACTORY, tokenId);
    
    // Create the fractionalization contract
    toast.info('Creating fractionalization contract. Please confirm the transaction.');
    
    const tx = await factory.createFractionalization(
      name,
      symbol,
      ipnftContractAddress,
      tokenId,
      totalShares,
      initialPrice,
      { value: creationFee }
    );
    
    toast.info('Transaction submitted. Waiting for confirmation...', {
      id: tx.hash,
      duration: 10000,
    });
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    // Find the FractionalizationCreated event in the logs
    const createdEvent = receipt.events?.find(
      (e: any) => e.event === 'FractionalizationCreated'
    );
    
    // Extract the fractionalization contract address from the event
    const fractionalizationAddress = createdEvent?.args?.fractionalizationContract;
    
    toast.success('Fractionalization created successfully!', { id: tx.hash });
    
    return {
      transactionHash: receipt.transactionHash,
      fractionalizationAddress,
      tokenId,
      ipnftContract: ipnftContractAddress,
      shares: totalShares,
      price: initialPrice.toString(),
    };
  } catch (error) {
    console.error('Error fractionalizing IPNFT:', error);
    
    if ((error as any).code === 4001) {
      toast.error('Transaction rejected. Please approve the transaction to fractionalize your IPNFT.');
    } else {
      toast.error(`Failed to fractionalize IPNFT: ${(error as Error).message}`);
    }
    
    throw error;
  }
};

/**
 * Buy shares of a fractionalized IPNFT
 * @param fractionAddress The fractionalization contract address
 * @param tokenAmount The number of tokens to buy
 * @param pricePerToken The price per token in wei
 * @returns Transaction details
 */
export const buyFractionShares = async (
  fractionAddress: string,
  tokenAmount: string,
  pricePerToken: string
) => {
  try {
    const contract = await getFractionalizationTokenContract(fractionAddress, true);
    
    // Calculate total cost including platform fee
    const baseCost = ethers.BigNumber.from(tokenAmount).mul(pricePerToken);
    const platformFee = baseCost.mul(300).div(10000); // 3% platform fee
    const totalCost = baseCost.add(platformFee);
    
    toast.info(`Buying ${tokenAmount} tokens for ${ethers.utils.formatEther(totalCost)} ETH`);
    
    // Send the transaction
    const tx = await contract.buyTokens(tokenAmount, { value: totalCost });
    
    toast.info('Transaction submitted. Waiting for confirmation...', {
      id: tx.hash,
      duration: 10000,
    });
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    toast.success('Tokens purchased successfully!', { id: tx.hash });
    
    return {
      transactionHash: receipt.transactionHash,
      fractionAddress,
      tokenAmount,
      cost: totalCost.toString(),
    };
  } catch (error) {
    console.error('Error buying fraction shares:', error);
    
    if ((error as any).code === 4001) {
      toast.error('Transaction rejected. Please approve the transaction to buy tokens.');
    } else {
      toast.error(`Failed to buy tokens: ${(error as Error).message}`);
    }
    
    throw error;
  }
};

/**
 * Sell shares of a fractionalized IPNFT
 * @param fractionAddress The fractionalization contract address
 * @param tokenAmount The number of tokens to sell
 * @returns Transaction details
 */
export const sellFractionShares = async (
  fractionAddress: string,
  tokenAmount: string
) => {
  try {
    const contract = await getFractionalizationTokenContract(fractionAddress, true);
    
    toast.info(`Selling ${tokenAmount} tokens`);
    
    // Send the transaction
    const tx = await contract.sellTokens(tokenAmount);
    
    toast.info('Transaction submitted. Waiting for confirmation...', {
      id: tx.hash,
      duration: 10000,
    });
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    toast.success('Tokens sold successfully!', { id: tx.hash });
    
    return {
      transactionHash: receipt.transactionHash,
      fractionAddress,
      tokenAmount,
    };
  } catch (error) {
    console.error('Error selling fraction shares:', error);
    
    if ((error as any).code === 4001) {
      toast.error('Transaction rejected. Please approve the transaction to sell tokens.');
    } else {
      toast.error(`Failed to sell tokens: ${(error as Error).message}`);
    }
    
    throw error;
  }
};

/**
 * Enable redemption for a fractionalized IPNFT
 * @param fractionAddress The fractionalization contract address
 * @param redemptionPrice The redemption price in wei
 * @returns Transaction details
 */
export const enableRedemption = async (
  fractionAddress: string,
  redemptionPrice: string
) => {
  try {
    const contract = await getFractionalizationTokenContract(fractionAddress, true);
    
    toast.info(`Enabling redemption at ${ethers.utils.formatEther(redemptionPrice)} ETH`);
    
    // Send the transaction
    const tx = await contract.enableRedemption(redemptionPrice);
    
    toast.info('Transaction submitted. Waiting for confirmation...', {
      id: tx.hash,
      duration: 10000,
    });
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    toast.success('Redemption enabled successfully!', { id: tx.hash });
    
    return {
      transactionHash: receipt.transactionHash,
      fractionAddress,
      redemptionPrice,
    };
  } catch (error) {
    console.error('Error enabling redemption:', error);
    
    if ((error as any).code === 4001) {
      toast.error('Transaction rejected. Please approve the transaction to enable redemption.');
    } else {
      toast.error(`Failed to enable redemption: ${(error as Error).message}`);
    }
    
    throw error;
  }
};

// Fractionalization Factory contract address
const FRACTIONALIZATION_FACTORY_ADDRESS = BLOCKCHAIN_CONFIG.CONTRACTS.FRACTIONALIZATION_FACTORY || "0x0000000000000000000000000000000000000000"; // Replace with the actual address

/**
 * Get the connected user's Ethereum address
 * @returns The Ethereum address or null if not connected
 */
export const getAddress = async (): Promise<string> => {
  try {
    const signer = await getSigner();
    return await signer.getAddress();
  } catch (error) {
    console.error('Error getting address:', error);
    throw error;
  }
};

/**
 * Approve a contract to transfer an IPNFT
 * @param ipnftContractAddress The IPNFT contract address
 * @param spenderAddress The address of the contract to approve
 * @param tokenId The token ID to approve for transfer
 * @returns Transaction receipt
 */
export const approveIPNFTTransfer = async (
  ipnftContractAddress: string,
  spenderAddress: string,
  tokenId: string
): Promise<ethers.ContractReceipt> => {
  try {
    const ipnftContract = await getIPNFTRegistryContract(true);
    
    toast.info('Approving transfer. Please confirm the transaction.');
    
    // Send the approval transaction
    const tx = await ipnftContract.approve(spenderAddress, tokenId);
    
    toast.info('Approval transaction submitted. Waiting for confirmation...', {
      id: tx.hash,
      duration: 10000,
    });
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    toast.success('Approval confirmed!', { id: tx.hash });
    
    return receipt;
  } catch (error) {
    console.error('Error approving IPNFT transfer:', error);
    
    if ((error as any).code === 4001) {
      toast.error('Transaction rejected. Please approve the transaction.');
    } else {
      toast.error(`Failed to approve IPNFT transfer: ${(error as Error).message}`);
    }
    
    throw error;
  }
};
