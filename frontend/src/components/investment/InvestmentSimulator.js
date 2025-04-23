import React, { useState, useEffect } from 'react';

const InvestmentSimulator = ({ asset }) => {
  const [tokenAmount, setTokenAmount] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState(null);

  // Calculate investment amount based on token amount
  useEffect(() => {
    if (tokenAmount && asset) {
      const calculatedAmount = (parseFloat(tokenAmount) * asset.tokenPrice).toFixed(2);
      setInvestmentAmount(calculatedAmount);
    }
  }, [tokenAmount, asset]);

  // Handle token amount change
  const handleTokenAmountChange = (e) => {
    const value = e.target.value;
    setTokenAmount(value);
  };

  // Handle investment
  const handleInvest = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in to invest');
      }
      
      // First simulate the transaction
      const simulationResponse = await fetch('/api/simulation/simulate-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assetId: asset._id,
          tokenAmount,
          transactionType: 'buy'
        })
      });
      
      const simulationData = await simulationResponse.json();
      
      if (!simulationResponse.ok) {
        throw new Error(simulationData.message || 'Transaction simulation failed');
      }
      
      // Then make the actual investment
      const investResponse = await fetch(`/api/assets/${asset._id}/invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tokensAmount: tokenAmount,
          investmentAmount
        })
      });
      
      const investData = await investResponse.json();
      
      if (!investResponse.ok) {
        throw new Error(investData.message || 'Investment failed');
      }
      
      // Set transaction data and success state
      setTransaction(simulationData.transaction);
      setSuccess(true);
      
      // Reset form
      setTokenAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">Investment Simulator</h3>
      
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && transaction && (
        <div className="bg-green-600 text-white p-4 rounded mb-4">
          <h4 className="font-bold mb-2">Transaction Successful!</h4>
          <p>Transaction Hash: {transaction.transactionHash}</p>
          <p>Tokens Purchased: {transaction.tokenAmount}</p>
          <p>Transaction Fee: {transaction.fee} SOL</p>
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="tokenAmount" className="block text-sm font-medium text-gray-300 mb-1">
          Number of Tokens
        </label>
        <input
          type="number"
          id="tokenAmount"
          value={tokenAmount}
          onChange={handleTokenAmountChange}
          min="1"
          max={asset?.totalTokens || 1000}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-300 mb-1">
          Investment Amount ({asset?.currency || 'INR'})
        </label>
        <input
          type="text"
          id="investmentAmount"
          value={investmentAmount}
          readOnly
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      
      <div className="mb-4 text-gray-300 text-sm">
        <p>Token Price: {asset?.tokenPrice || 0} {asset?.currency || 'INR'} per token</p>
        <p>Minimum Investment: {asset?.minInvestment || 0} {asset?.currency || 'INR'}</p>
        <p>Expected Annual Yield: {asset?.expectedYield || 0}%</p>
      </div>
      
      <button
        onClick={handleInvest}
        disabled={loading || !tokenAmount || parseFloat(tokenAmount) <= 0}
        className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Invest Now'}
      </button>
      
      <div className="mt-4 text-xs text-gray-400">
        <p>* This is a simulation. No actual blockchain transactions will be executed.</p>
        <p>* Transaction fees are estimated based on current Solana network conditions.</p>
      </div>
    </div>
  );
};

export default InvestmentSimulator;
