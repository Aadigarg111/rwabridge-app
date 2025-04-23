import React, { useState, useEffect } from 'react';

const TokenizationSimulator = ({ asset, onTokenizationComplete }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [contractAddress, setContractAddress] = useState('');

  // Steps in tokenization process
  const steps = [
    'Validating asset documentation',
    'Creating smart contract',
    'Deploying to Solana blockchain',
    'Minting tokens',
    'Finalizing tokenization'
  ];

  // Simulate tokenization process
  const startTokenization = async () => {
    if (!asset || !asset._id) {
      setError('Invalid asset data');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);
    setStep(1);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in to tokenize assets');
      }

      // Simulate each step of the process
      for (let i = 1; i <= steps.length; i++) {
        setStep(i);
        
        // Simulate processing time for each step
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update progress
        setProgress(Math.floor((i / steps.length) * 100));
      }

      // Final API call to simulate tokenization
      const response = await fetch(`/api/simulation/tokenize/${asset._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Tokenization failed');
      }

      // Set result and contract address
      setResult(data.tokenization);
      setContractAddress(data.tokenization.contractAddress);

      // Update asset tokenization status in database
      const updateResponse = await fetch(`/api/assets/${asset._id}/tokenization`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tokenizationStatus: 'completed',
          contractAddress: data.tokenization.contractAddress
        })
      });

      if (!updateResponse.ok) {
        console.error('Failed to update asset tokenization status');
      }

      // Call completion callback if provided
      if (onTokenizationComplete) {
        onTokenizationComplete(data.tokenization);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">Asset Tokenization</h3>
      
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {result ? (
        <div className="bg-green-600 text-white p-4 rounded mb-4">
          <h4 className="font-bold mb-2">Tokenization Successful!</h4>
          <p>Contract Address: {result.contractAddress}</p>
          <p>Transaction Hash: {result.transactionHash}</p>
          <p>Status: {result.status}</p>
          <p>Timestamp: {new Date(result.timestamp).toLocaleString()}</p>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-purple-300">
                  {steps[step - 1]}
                </span>
                <span className="text-sm font-medium text-purple-300">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="mt-4 text-gray-400">
                <p>Step {step} of {steps.length}: {steps[step - 1]}</p>
              </div>
            </div>
          ) : (
            <div className="mb-6 text-gray-300 text-sm">
              <p>This process will tokenize your asset on the Solana blockchain, creating a smart contract and minting tokens that represent ownership shares.</p>
              <p className="mt-2">Asset: {asset?.title}</p>
              <p>Total Value: {asset?.totalValue} {asset?.currency}</p>
              <p>Total Tokens: {asset?.totalTokens}</p>
              <p>Token Symbol: {asset?.tokenSymbol}</p>
            </div>
          )}
          
          <button
            onClick={startTokenization}
            disabled={loading || !asset}
            className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Start Tokenization'}
          </button>
        </>
      )}
      
      <div className="mt-4 text-xs text-gray-400">
        <p>* This is a simulation. No actual blockchain transactions will be executed.</p>
        <p>* In a production environment, this process would require legal documentation and regulatory compliance.</p>
      </div>
    </div>
  );
};

export default TokenizationSimulator;
