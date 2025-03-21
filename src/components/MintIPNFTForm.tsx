import React, { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { useWeb3 } from './Web3Provider';
import { IPNFTRegistryService } from '../services/contractService';
import { uploadToNFTStorage } from '../services/ipfsService';

// IP categories
const IP_CATEGORIES = [
  { id: 0, name: 'Patent' },
  { id: 1, name: 'Trademark' },
  { id: 2, name: 'Copyright' },
  { id: 3, name: 'Trade Secret' },
  { id: 4, name: 'Design' },
  { id: 5, name: 'Other' }
];

// Development stages for IP assets
const DEVELOPMENT_STAGES = [
  { id: 0, name: 'Concept' },
  { id: 1, name: 'Research' },
  { id: 2, name: 'Development' },
  { id: 3, name: 'Testing' },
  { id: 4, name: 'Production' },
  { id: 5, name: 'Commercialized' }
];

interface MintIPNFTFormProps {
  onSuccess?: (tokenId: string) => void;
}

const MintIPNFTForm: React.FC<MintIPNFTFormProps> = ({ onSuccess }) => {
  const { signer, isConnected, isCorrectNetwork } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [uploadingToIPFS, setUploadingToIPFS] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<number>(0);
  const [developmentStage, setDevelopmentStage] = useState<number>(0);
  const [institution, setInstitution] = useState('');
  const [registrationDetails, setRegistrationDetails] = useState('');
  const [valuation, setValuation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Handle image file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signer || !isConnected || !isCorrectNetwork) {
      toast.error('Please connect your wallet to Polygon Amoy Testnet');
      return;
    }
    
    if (!title || !description || !valuation || !imageFile) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // 1. Upload metadata and image to IPFS
      setUploadingToIPFS(true);
      toast.info('Uploading to IPFS...');
      
      const metadata = {
        name: title,
        description,
        properties: {
          category,
          developmentStage,
          institution,
          registrationDetails,
          valuation,
        }
      };
      
      const metadataURI = await uploadToNFTStorage(metadata, imageFile);
      
      setUploadingToIPFS(false);
      toast.success('Successfully uploaded to IPFS');
      
      // 2. Convert valuation to BigNumber
      const valuationBN = ethers.utils.parseEther(valuation);
      
      // 3. Call mint function on the contract
      toast.info('Minting your IP NFT...');
      const tokenId = await IPNFTRegistryService.mintIPNFT(
        signer,
        title,
        description,
        category,
        valuationBN,
        metadataURI
      );
      
      toast.success(`IP NFT minted successfully! Token ID: ${tokenId.toString()}`);
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategory(0);
      setDevelopmentStage(0);
      setInstitution('');
      setRegistrationDetails('');
      setValuation('');
      setImageFile(null);
      setPreviewUrl('');
      
      // Call onSuccess callback
      if (onSuccess) {
        onSuccess(tokenId.toString());
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error(`Failed to mint NFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setUploadingToIPFS(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-indigo-800">Mint Intellectual Property NFT</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter the IP title"
                required
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe your intellectual property"
                rows={4}
                required
              />
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {IP_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Development Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Development Stage <span className="text-red-500">*</span>
              </label>
              <select
                value={developmentStage}
                onChange={(e) => setDevelopmentStage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {DEVELOPMENT_STAGES.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Institution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution or Owner
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Research institution or owner"
              />
            </div>
            
            {/* Registration Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration/Patent Details
              </label>
              <input
                type="text"
                value={registrationDetails}
                onChange={(e) => setRegistrationDetails(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Patent number, registration details, etc."
              />
            </div>
            
            {/* Valuation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valuation (MATIC) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valuation}
                onChange={(e) => setValuation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter valuation in MATIC"
                required
              />
            </div>
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                  required
                />
              </div>
              {previewUrl && (
                <div className="mt-2">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="h-32 w-32 object-cover rounded-md border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading || !isConnected || !isCorrectNetwork}
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition-all ${
              loading || !isConnected || !isCorrectNetwork
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                {uploadingToIPFS ? 'Uploading to IPFS...' : 'Minting...'}
                <svg className="animate-spin ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            ) : 'Mint IP NFT'}
          </button>
        </div>
        
        {!isConnected && (
          <p className="text-red-500 text-sm mt-2">
            Please connect your wallet to mint an IP NFT.
          </p>
        )}
        
        {isConnected && !isCorrectNetwork && (
          <p className="text-red-500 text-sm mt-2">
            Please switch to the Polygon Amoy Testnet to mint an IP NFT.
          </p>
        )}
      </form>
    </div>
  );
};

export default MintIPNFTForm; 