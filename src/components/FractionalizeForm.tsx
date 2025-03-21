import React, { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { useWeb3 } from './Web3Provider';

interface FractionalizeFormProps {
  tokenId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const FractionalizeForm: React.FC<FractionalizeFormProps> = ({ 
  tokenId, 
  onClose,
  onSuccess
}) => {
  const { signer, isConnected, isCorrectNetwork } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [fractionCount, setFractionCount] = useState('100');
  const [fractionPrice, setFractionPrice] = useState('0.01');
  const [totalValue, setTotalValue] = useState('1');
  const [minInvestment, setMinInvestment] = useState('0.1');
  const [maxInvestment, setMaxInvestment] = useState('10');
  const [restrictTransfers, setRestrictTransfers] = useState(false);

  // Update total value when fraction count or price changes
  const handleFractionCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = e.target.value;
    setFractionCount(count);
    
    // Update total value
    if (count && fractionPrice) {
      const total = Number(count) * Number(fractionPrice);
      setTotalValue(total.toString());
    }
  };

  const handleFractionPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price = e.target.value;
    setFractionPrice(price);
    
    // Update total value
    if (fractionCount && price) {
      const total = Number(fractionCount) * Number(price);
      setTotalValue(total.toString());
    }
  };

  // Mock fractionalization function (in a real app, call the contract)
  const fractionalize = async () => {
    if (!signer || !isConnected || !isCorrectNetwork) {
      toast.error('Please connect your wallet to the correct network');
      return;
    }

    try {
      setLoading(true);
      
      // This would be the actual contract call in a real app
      // const contracts = getContracts(signer);
      // const tx = await contracts.fractionalVault.fractionalize(
      //   tokenId,
      //   ethers.utils.parseUnits(fractionCount, 0),
      //   ethers.utils.parseEther(fractionPrice),
      //   ethers.utils.parseEther(minInvestment),
      //   ethers.utils.parseEther(maxInvestment),
      //   restrictTransfers
      // );
      // await tx.wait();
      
      // Instead, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Successfully fractionalized IP NFT #${tokenId} into ${fractionCount} fractions`);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error fractionalizing NFT:', error);
      toast.error('Failed to fractionalize NFT');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fractionalize();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Fractionalize IP NFT #{tokenId}</h2>
          <button 
            onClick={onClose}
            className="text-white opacity-80 hover:opacity-100 transition-opacity"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Fractionalize your IP NFT to create tradable tokens representing partial ownership of your intellectual property.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Number of Fractions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Fractions
              </label>
              <input
                type="number"
                min="2"
                step="1"
                value={fractionCount}
                onChange={handleFractionCountChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                How many individual tokens to create (minimum 2)
              </p>
            </div>

            {/* Price Per Fraction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Per Fraction (MATIC)
              </label>
              <input
                type="number"
                min="0.000001"
                step="0.001"
                value={fractionPrice}
                onChange={handleFractionPriceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Initial price of each fractional token
              </p>
            </div>

            {/* Total Value (calculated) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Value (MATIC)
              </label>
              <input
                type="text"
                value={totalValue}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                The total initial value of all fractions
              </p>
            </div>

            {/* Investment Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Investment (MATIC)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minInvestment}
                  onChange={(e) => setMinInvestment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Investment (MATIC)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxInvestment}
                  onChange={(e) => setMaxInvestment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Restrictions */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="restrictTransfers"
                checked={restrictTransfers}
                onChange={(e) => setRestrictTransfers(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="restrictTransfers" className="ml-2 block text-sm text-gray-700">
                Restrict transfers to verified addresses only
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isConnected || !isCorrectNetwork}
                className={`w-full px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading || !isConnected || !isCorrectNetwork
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : 'Fractionalize'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FractionalizeForm; 