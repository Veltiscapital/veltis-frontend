/**
 * Contract ABI definitions for the Veltis platform
 */

// Secondary Market ABI
export const SECONDARY_MARKET_ABI = [
  // Events
  "event ListingCreated(uint256 indexed listingId, address indexed seller, address indexed tokenContract, uint256 tokenId, uint256 price, uint256 amount, uint256 expirationTime, uint8 listingType)",
  "event ListingCancelled(uint256 indexed listingId)",
  "event ListingPurchased(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 price)",
  "event AuctionEnded(uint256 indexed listingId, address indexed highestBidder, uint256 highestBid)",
  "event BidPlaced(uint256 indexed listingId, address indexed bidder, uint256 amount, uint256 bid)",
  
  // View functions
  "function getListingById(uint256 listingId) external view returns (tuple(uint256 id, address seller, address tokenContract, uint256 tokenId, uint256 price, uint256 amount, uint256 expirationTime, uint8 listingType, bool active, address highestBidder, uint256 highestBid))",
  "function getActiveListingIds() external view returns (uint256[])",
  "function getUserListingIds(address user) external view returns (uint256[])",
  "function getUserPurchaseIds(address user) external view returns (uint256[])",
  
  // User interaction functions
  "function createFixedPriceListing(address tokenContract, uint256 tokenId, uint256 price, uint256 amount, uint256 duration) external returns (uint256)",
  "function createAuction(address tokenContract, uint256 tokenId, uint256 startingPrice, uint256 amount, uint256 duration) external returns (uint256)",
  "function cancelListing(uint256 listingId) external",
  "function purchaseListing(uint256 listingId, uint256 amount) external payable",
  "function placeBid(uint256 listingId) external payable",
  "function endAuction(uint256 listingId) external",
  "function withdrawBid(uint256 listingId) external",
  
  // Admin functions
  "function setFeePercentage(uint256 newFeePercentage) external",
  "function withdrawFees() external",
  "function pause() external",
  "function unpause() external"
];

// IP NFT Registry ABI
export const IPNFT_REGISTRY_ABI = [
  // Events
  "event IPNFTMinted(uint256 indexed tokenId, address indexed owner, string title, uint256 valuationUSD)",
  "event IPNFTVerified(uint256 indexed tokenId, address indexed verifier)",
  "event IPNFTFrozen(uint256 indexed tokenId, address indexed freezer)",
  "event IPNFTUnfrozen(uint256 indexed tokenId, address indexed unfreezer)",
  "event IPNFTRecovered(uint256 indexed tokenId, address indexed recoverer, address newOwner)",
  "event IPNFTValuationUpdated(uint256 indexed tokenId, uint256 oldValuation, uint256 newValuation)",
  "event RoyaltyUpdated(uint256 indexed tokenId, address recipient, uint256 percentage)",
  "event TransferRestrictionEnabled(uint256 indexed tokenId)",
  "event TransferRestrictionDisabled(uint256 indexed tokenId)",
  
  // Token information functions
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function getIPMetadata(uint256 tokenId) external view returns (tuple(string title, string[] authors, string institution, uint256 filingDate, uint256 expirationDate, string ipfsCID, string ipType, string developmentStage, string digitalFingerprint, bool verified, uint256 mintTimestamp, uint256 verificationTimestamp))",
  "function getValuation(uint256 tokenId) external view returns (uint256)",
  "function getRoyaltyInfo(uint256 tokenId) external view returns (address, uint256)",
  "function isVerified(uint256 tokenId) external view returns (bool)",
  "function isFrozen(uint256 tokenId) external view returns (bool)",
  "function isTransferRestricted(uint256 tokenId) external view returns (bool)",
  
  // Token approval functions
  "function approve(address to, uint256 tokenId) external",
  "function getApproved(uint256 tokenId) external view returns (address)",
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  
  // Core functionality
  "function mint(string memory title, string[] memory authors, string memory institution, uint256 filingDate, uint256 expirationDate, string memory ipfsCID, string memory ipType, string memory developmentStage, string memory digitalFingerprint, uint256 valuationUSD, address royaltyRecipient, uint256 royaltyPercentage) external payable returns (uint256)",
  "function transferWithFee(address from, address to, uint256 tokenId) external payable",
  "function verify(uint256 tokenId) external",
  "function freeze(uint256 tokenId) external",
  "function unfreeze(uint256 tokenId) external",
  "function recover(uint256 tokenId, address newOwner) external",
  "function updateValuation(uint256 tokenId, uint256 newValuationUSD) external",
  "function updateRoyaltySettings(uint256 tokenId, address recipient, uint256 percentage) external",
  "function enableTransferRestriction(uint256 tokenId) external",
  "function disableTransferRestriction(uint256 tokenId) external",
  
  // Admin functions
  "function setRuleEngine(address newRuleEngine) external",
  "function setFeePercentage(uint256 newFeePercentage) external",
  "function withdrawFees() external",
  "function pause() external",
  "function unpause() external"
];

// CMTAT Token ABI
export const CMTAT_TOKEN_ABI = [
  // ERC20 standard functions
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  
  // CMTAT specific functions
  "function termsUri() external view returns (string memory)",
  "function setTermsUri(string calldata newTermsUri) external",
  "function infoUri() external view returns (string memory)",
  "function setInfoUri(string calldata newInfoUri) external",
  "function enforceTransferRestriction() external view returns (bool)",
  "function checkTransferRestriction(address from, address to, uint256 value) external view returns (bool)",
  "function messageForTransferRestriction(uint8 restrictionCode) external view returns (string memory)",
  
  // CMTAT control functions
  "function mint(address to, uint256 amount) external",
  "function burn(uint256 amount) external",
  "function burnFrom(address account, uint256 amount) external",
  "function pause() external",
  "function unpause() external",
  "function setRuleEngine(address newRuleEngine) external"
];

// Fractionalization ABI
export const FRACTIONALIZATION_ABI = [
  // Events
  "event Fractionalized(uint256 indexed ipnftId, address indexed ipnftContract, address indexed fractionToken, uint256 totalShares, uint256 initialPrice)",
  "event FractionRedeemed(address indexed fractionToken, address redeemer, uint256 amount)",
  
  // Factory functions
  "function createFractionalization(address ipnftContract, uint256 tokenId, string memory name, string memory symbol, uint256 totalShares, uint256 initialPrice, string memory description) external returns (address)",
  "function getFractionalizationsByOwner(address owner) external view returns (address[])",
  
  // Fractionalization functions
  "function redeemFractions(uint256 amount) external",
  "function getOriginalNFT() external view returns (address, uint256)",
  "function getRedemptionPrice() external view returns (uint256)",
  
  // ERC20 functions for the fraction token
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
];

// Rule Engine ABI
export const RULE_ENGINE_ABI = [
  // Core functions
  "function validateTransfer(address from, address to, uint256 tokenId, address tokenContract) external view returns (bool)",
  "function requiresVerification(address tokenContract) external view returns (bool)",
  "function isTokenWhitelisted(address tokenContract) external view returns (bool)",
  "function isAddressWhitelisted(address account) external view returns (bool)",
  
  // Events
  "function TransferabilityChanged(address indexed tokenContract, bool transferable)",
  "function VerificationRequirementChanged(address indexed tokenContract, bool required)",
  "function TokenWhitelistStatusChanged(address indexed tokenContract, bool whitelisted)",
  "function AddressWhitelistStatusChanged(address indexed account, bool whitelisted)",
  
  // Admin functions
  "function setTokenTransferable(address tokenContract, bool transferable) external",
  "function setVerificationRequired(address tokenContract, bool required) external",
  "function setTokenWhitelistStatus(address tokenContract, bool whitelisted) external",
  "function setAddressWhitelistStatus(address account, bool whitelisted) external",
  "function setBatchAddressWhitelistStatus(address[] calldata accounts, bool whitelisted) external"
];

// Verified Institutions ABI
export const VERIFIED_INSTITUTIONS_ABI = [
  // Events
  "event InstitutionRegistered(address indexed institutionAddress, string name, string country)",
  "event VerificationRequested(address indexed requester, uint256 indexed tokenId)",
  "event InstitutionVerified(address indexed institutionAddress, address indexed verifier)",
  "event InstitutionSuspended(address indexed institutionAddress, address indexed suspender)",
  "event InstitutionReinstated(address indexed institutionAddress, address indexed reinstater)",
  
  // Institution management
  "function registerInstitution(string memory name, string memory country, string memory website, string memory documentCID) external",
  "function requestVerification(uint256 tokenId) external",
  "function verifyInstitution(address institutionAddress) external",
  "function suspendInstitution(address institutionAddress) external",
  "function reinstateInstitution(address institutionAddress) external",
  
  // View functions
  "function getInstitutionInfo(address institutionAddress) external view returns (tuple(string name, string country, string website, string documentCID, bool verified, bool suspended, uint256 registrationTimestamp))",
  "function isInstitutionVerified(address institutionAddress) external view returns (bool)",
  "function isInstitutionSuspended(address institutionAddress) external view returns (bool)",
  "function getVerificationRequests() external view returns (tuple(address requester, uint256 tokenId, uint256 timestamp)[])",
  
  // Admin functions
  "function setVerifier(address newVerifier, bool status) external",
  "function pause() external",
  "function unpause() external"
]; 