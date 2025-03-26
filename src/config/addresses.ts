/**
 * Contract addresses for the Veltis platform
 * 
 * These addresses should be updated based on the deployment environment
 * (development, staging, production)
 */

// Type definition for contract addresses
export interface ContractAddresses {
  IPNFT_REGISTRY: string;
  VERIFIED_INSTITUTIONS: string;
  RULE_ENGINE: string;
  CMTAT_TOKEN: string;
  FRACTIONALIZATION_FACTORY: string;
  SECONDARY_MARKET: string;
}

// Development environment addresses (localhost or testnet)
const devAddresses: ContractAddresses = {
  IPNFT_REGISTRY: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  VERIFIED_INSTITUTIONS: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  RULE_ENGINE: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  CMTAT_TOKEN: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  FRACTIONALIZATION_FACTORY: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  SECONDARY_MARKET: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
};

// Staging environment addresses (testnet)
const stagingAddresses: ContractAddresses = {
  IPNFT_REGISTRY: '0x4B9241bce54F8903101cad9b7b0ff20ed9Cd04E1',
  VERIFIED_INSTITUTIONS: '0x7AcF8C303B06F8187BD00557118Bd07a29357D78',
  RULE_ENGINE: '0x09a241E663b8acb32E8f1AfE6bF6d1c770AfA43b',
  CMTAT_TOKEN: '0x3e4dF6C1cf78E23A10F1f27ED1284f6D7544634b',
  FRACTIONALIZATION_FACTORY: '0x98BEe66E92d7a245b07e3196CEa1BF6d0f7dA90F',
  SECONDARY_MARKET: '0xA87ba3CB3F310e39c626793E5e7F3C2cYOUR_CONTRACT_ADDRESS',
};

// Production environment addresses (mainnet)
const prodAddresses: ContractAddresses = {
  IPNFT_REGISTRY: '0x0000000000000000000000000000000000000000', // Replace with actual mainnet addresses
  VERIFIED_INSTITUTIONS: '0x0000000000000000000000000000000000000000',
  RULE_ENGINE: '0x0000000000000000000000000000000000000000',
  CMTAT_TOKEN: '0x0000000000000000000000000000000000000000',
  FRACTIONALIZATION_FACTORY: '0x0000000000000000000000000000000000000000',
  SECONDARY_MARKET: '0x0000000000000000000000000000000000000000',
};

// Function to get the correct addresses based on environment
export function getAddresses(): ContractAddresses {
  const env = process.env.REACT_APP_ENV || 'development';
  
  switch (env) {
    case 'production':
      return prodAddresses;
    case 'staging':
      return stagingAddresses;
    case 'development':
    default:
      return devAddresses;
  }
}

// Export default addresses (development)
export default devAddresses; 