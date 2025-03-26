import React, { useState } from 'react';
import { testPinataConnection } from '../services/pinataService';

const PinataTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const handleTest = async () => {
    try {
      setTesting(true);
      setResult(null);
      
      console.log('Testing Pinata API connection...');
      const testResult = await testPinataConnection();
      
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
      <h3 style={{ marginTop: 0 }}>Pinata API Test</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <p>API Key: {import.meta.env.VITE_PINATA_API_KEY ? '********' : 'Not set'}</p>
        <p>API Secret: {import.meta.env.VITE_PINATA_API_SECRET ? '********' : 'Not set'}</p>
        <p>JWT: {import.meta.env.VITE_PINATA_JWT ? '********' : 'Not set'}</p>
        
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
          <h4 style={{ marginTop: 0 }}>Pinata API Information</h4>
          
          <div style={{ 
            padding: '8px',
            marginBottom: '10px',
            background: '#e3f9f4',
            border: '1px solid #6ed5c8',
            borderRadius: '4px'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>ℹ️ About Pinata</p>
            <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>
              Pinata is a pinning service that provides:
            </p>
            <ul style={{ margin: '0 0 5px 0', paddingLeft: '20px', fontSize: '13px' }}>
              <li>Simple API for uploading files to IPFS</li>
              <li>Dedicated IPFS gateway for fast content delivery</li>
              <li>Reliable pinning to ensure your content stays available</li>
              <li>Pinata is a recommended alternative as NFT.Storage transitions</li>
            </ul>
          </div>
          
          <h5 style={{ marginTop: '15px', marginBottom: '5px' }}>API Details</h5>
          <p>Pinata provides multiple authentication methods:</p>
          <ul>
            <li>API Key + Secret combination (traditional auth)</li>
            <li>JWT (more secure, recommended for production)</li>
          </ul>
          <p>Base endpoint: <code>https://api.pinata.cloud/</code></p>
          <p>Gateway URL: <code>https://gateway.pinata.cloud/ipfs/YOUR_CID</code></p>
          
          <h5 style={{ marginTop: '15px', marginBottom: '5px' }}>API Key Configuration</h5>
          <p>You have selected these scopes for your API key:</p>
          <ul>
            <li><strong>pinFileToIPFS</strong>: Upload files to IPFS</li>
            <li><strong>pinJSONToIPFS</strong>: Upload JSON metadata</li>
            <li><strong>pinList</strong>: List your pinned content</li>
          </ul>
          <p>These permissions are sufficient for basic NFT creation.</p>
        </div>
      )}
    </div>
  );
};

export default PinataTest; 