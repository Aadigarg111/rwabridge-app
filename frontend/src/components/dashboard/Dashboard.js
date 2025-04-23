import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [walletBalance, setWalletBalance] = useState({ sol: 0, usdc: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch wallet balance
      const balanceResponse = await fetch('/api/simulation/wallet-balance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setWalletBalance(balanceData.balance);
      }

      // Fetch transaction history
      const transactionsResponse = await fetch('/api/simulation/transaction-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions);
      }

      // Fetch user's assets if user is an asset owner
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && (storedUser.role === 'asset-owner' || storedUser.role === 'admin')) {
        const assetsResponse = await fetch('/api/assets/user/assets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (assetsResponse.ok) {
          const assetsData = await assetsResponse.json();
          setAssets(assetsData.assets);
        }
      }

      // Fetch user's investments
      const investmentsResponse = await fetch('/api/assets/user/investments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (investmentsResponse.ok) {
        const investmentsData = await investmentsResponse.json();
        setInvestments(investmentsData.assets);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <span className="ml-3">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {user?.name || 'User'}</h1>
          <p className="text-gray-400">
            {user?.role === 'asset-owner' 
              ? 'Manage your assets and track tokenization' 
              : 'Explore investment opportunities and manage your portfolio'}
          </p>
        </div>

        {/* Dashboard Tabs */}
        <div className="mb-6 border-b border-gray-700">
          <nav className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            {user?.role === 'asset-owner' && (
              <button
                onClick={() => setActiveTab('myAssets')}
                className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'myAssets'
                    ? 'border-purple-500 text-purple-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                My Assets
              </button>
            )}
            <button
              onClick={() => setActiveTab('investments')}
              className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'investments'
                  ? 'border-purple-500 text-purple-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Investments
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-purple-500 text-purple-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Transactions
            </button>
          </nav>
        </div>

        {/* Dashboard Content */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
              
              {/* Wallet Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Wallet Balance</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">SOL</p>
                      <p className="text-xl font-bold">{walletBalance.sol}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">USDC</p>
                      <p className="text-xl font-bold">{walletBalance.usdc}</p>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm">
                      Connect Wallet
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">Portfolio Summary</h3>
                  <div>
                    <p className="text-gray-400 text-sm">Total Investments</p>
                    <p className="text-xl font-bold">{investments.length}</p>
                    <p className="text-gray-400 text-sm mt-2">Recent Transactions</p>
                    <p className="text-xl font-bold">{transactions.length}</p>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link href="/marketplace" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-center py-3 px-4 rounded-lg">
                    Explore Assets
                  </Link>
                  {user?.role === 'asset-owner' && (
                    <Link href="/assets/create" className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-center py-3 px-4 rounded-lg">
                      Create Asset
                    </Link>
                  )}
                  <Link href="/profile" className="bg-gray-600 hover:bg-gray-700 text-white text-center py-3 px-4 rounded-lg">
                    Edit Profile
                  </Link>
                  <Link href="/help" className="bg-gray-600 hover:bg-gray-700 text-white text-center py-3 px-4 rounded-lg">
                    Get Help
                  </Link>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
                {transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {transactions.slice(0, 5).map((tx) => (
                          <tr key={tx.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                tx.transactionType === 'buy' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                              }`}>
                                {tx.transactionType === 'buy' ? 'Purchase' : 'Sale'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {tx.tokenAmount} tokens
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400">No recent activity to display.</p>
                )}
              </div>
            </div>
          )}

          {/* My Assets Tab (for asset owners) */}
          {activeTab === 'myAssets' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Assets</h2>
                <Link href="/assets/create" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-4 rounded-md text-sm">
                  Create New Asset
                </Link>
              </div>
              
              {assets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assets.map((asset) => (
                    <div key={asset._id} className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-2">{asset.title}</h3>
                      <div className="mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          asset.status === 'active' ? 'bg-green-200 text-green-800' : 
                          asset.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                        </span>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                          {asset.assetType}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{asset.description}</p>
                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div>
                          <p className="text-gray-400">Total Value</p>
                          <p>{asset.totalValue} {asset.currency}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Token Price</p>
                          <p>{asset.tokenPrice} {asset.currency}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Total Tokens</p>
                          <p>{asset.totalTokens}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Tokenization</p>
                          <p>{asset.tokenizationStatus.replace('-', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/assets/${asset._id}`} className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded-md text-sm">
                          View Details
                        </Link>
                        {asset.tokenizationStatus !== 'completed' && (
                          <Link href={`/assets/${asset._id}/tokenize`} className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded-md text-sm">
                            Tokenize
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">You haven't created any assets yet.</p>
                  <Link href="/assets/create" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-4 rounded-md">
                    Create Your First Asset
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Investments Tab */}
          {activeTab === 'investments' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Investments</h2>
              
              {investments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {investments.map((investment) => (
                    <div key={investment._id} className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-2">{investment.title}</h3>
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                          {investment.assetType}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{investment.description}</p>
                      
                      {investment.investors.map(investor => 
                        investor.user === user?.id && (
                          <div key={investor.user} className="grid grid-cols-2 gap-2 mb-3 text-sm">
                            <div>
                              <p className="text-gray-400">Your Investment</p>
                              <p>{investor.investmentAmount} {investment.currency}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Tokens Owned</p>
                              <p>{investor.tokensOwned}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Investment Date</p>
                              <p>{new Date(investor.investmentDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Expected Yield</p>
                              <p>{investment.expectedYield}%</p>
                            </div>
                          </div>
                        )
                      )}
                      
                      <Link href={`/assets/${investment._id}`} className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded-md text-sm">
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">You haven't made any investments yet.</p>
                  <Link href="/marketplace" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 px-4 rounded-md">
                    Explore Investment Opportunities
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
              
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Transaction ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className="font-mono">{tx.transactionHash.substring(0, 10)}...</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tx.transactionType === 'buy' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                            }`}>
                              {tx.transactionType === 'buy' ? 'Purchase' : 'Sale'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {tx.tokenAmount} tokens
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                            {new Date(tx.timestamp).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {tx.fee} SOL
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400">No transactions to display.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
