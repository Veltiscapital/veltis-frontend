import React, { useState } from 'react';
import { testApiConnection } from '../services/ipfsService';

const NFTStorageTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const handleTest = async () => {
    try {
      setTesting(true);
      setResult(null);
      
      console.log('Testing NFT.Storage API connection...');
      const testResult = await testApiConnection();
      
      console.log('Test result:', testResult);
      setResult(testResult);
    } catch (error) {
      console.error('Test error:', error);
      setResult({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setTesting(false);
    }
  };
  
  return (
    <div style={{ 
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      maxWidth: '600px',
      margin: '20px auto'
    }}>
      <h3 style={{ marginTop: 0 }}>NFT.Storage API Test</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <p>API Key: {import.meta.env.VITE_NFT_STORAGE_API_KEY ? '********' : 'Not set'}</p>
        
        <button 
          onClick={handleTest}
          disabled={testing}
          style={{
            padding: '8px 16px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: testing ? 'wait' : 'pointer'
          }}
        >
          {testing ? 'Testing...' : 'Test API Connection'}
        </button>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginLeft: '10px',
            cursor: 'pointer'
          }}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {result && (
        <div style={{
          padding: '10px',
          borderRadius: '4px',
          background: result.success ? '#e6fff2' : '#ffebe6',
          border: `1px solid ${result.success ? '#2ecc71' : '#e74c3c'}`
        }}>
          <p style={{ 
            fontWeight: 'bold', 
            color: result.success ? '#2ecc71' : '#e74c3c',
            margin: '0 0 10px 0'
          }}>
            {result.success ? '✅ SUCCESS' : '❌ FAILED'}
          </p>
          <p style={{ margin: '0' }}>{result.message}</p>
        </div>
      )}
      
      {showDetails && (
        <div style={{ 
          marginTop: '20px',
          padding: '10px',
          background: '#f9f9f9',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <h4 style={{ marginTop: 0 }}>NFT.Storage Migration Information</h4>
          
          <div style={{ 
            padding: '8px',
            marginBottom: '10px',
            background: '#fff8e1',
            border: '1px solid #ffe082',
            borderRadius: '4px'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>⚠️ Important Service Change Notice</p>
            <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>
              NFT.Storage is updating their service offerings:
            </p>
            <ul style={{ margin: '0 0 5px 0', paddingLeft: '20px', fontSize: '13px' }}>
              <li>Original NFT.Storage (now "Classic") will stop accepting new uploads after June 30, 2024</li>
              <li>Our app now uses the new NFT.Storage API (app.nft.storage)</li>
              <li>API keys from app.nft.storage only work with app.nft.storage (not with classic.nft.storage)</li>
            </ul>
          </div>
          
          <h5 style={{ marginTop: '15px', marginBottom: '5px' }}>API Details</h5>
          <p>New NFT.Storage API uses the <code>Bearer</code> authentication scheme with your API key.</p>
          <p>Endpoint: <code>https://api.nft.storage/...</code></p>
          <p>Your current API key: <code>{import.meta.env.VITE_NFT_STORAGE_API_KEY}</code></p>
          <p>Check the console logs for detailed debugging information.</p>
          
          <h5 style={{ marginTop: '15px', marginBottom: '5px' }}>For More Information</h5>
          <p>Visit <a href="https://app.nft.storage" target="_blank" rel="noopener noreferrer">app.nft.storage</a> for details about the updated service.</p>
        </div>
      )}
    </div>
  );
};

export default NFTStorageTest; 