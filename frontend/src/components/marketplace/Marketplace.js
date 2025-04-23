import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const AssetCard = ({ asset }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-purple-500/20 hover:translate-y-[-2px]">
      <div className="h-40 bg-gradient-to-r from-purple-900 to-indigo-900 relative">
        {asset.images && asset.images.length > 0 ? (
          <img 
            src={asset.images[0]} 
            alt={asset.title} 
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl text-white/30">{asset.assetType === 'real-estate' ? '🏢' : 
              asset.assetType === 'agriculture' ? '🌾' : 
              asset.assetType === 'infrastructure' ? '🏗️' : 
              asset.assetType === 'art' ? '🎨' : '💼'}</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            asset.status === 'active' ? 'bg-green-200 text-green-800' : 
            asset.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
            'bg-gray-200 text-gray-800'
          }`}>
            {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-white">{asset.title}</h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-200 text-indigo-800">
            {asset.assetType}
          </span>
        </div>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{asset.description}</p>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
          <div>
            <p className="text-xs text-gray-500">Token Price</p>
            <p className="text-sm font-medium text-white">{asset.tokenPrice} {asset.currency}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Value</p>
            <p className="text-sm font-medium text-white">{asset.totalValue} {asset.currency}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Expected Yield</p>
            <p className="text-sm font-medium text-white">{asset.expectedYield}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Min Investment</p>
            <p className="text-sm font-medium text-white">{asset.minInvestment} {asset.currency}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link 
            href={`/assets/${asset._id}`}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200"
          >
            View Details
          </Link>
          {asset.status === 'active' && (
            <Link 
              href={`/assets/${asset._id}/invest`}
              className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Invest Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const Marketplace = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    assetType: 'all',
    status: 'active',
    search: '',
    sort: 'newest'
  });

  useEffect(() => {
    fetchAssets();
  }, [filters]);

  const fetchAssets = async () => {
    setLoading(true);
    setError('');

    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.assetType !== 'all') queryParams.append('assetType', filters.assetType);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      
      // Set sort parameter
      if (filters.sort === 'newest') queryParams.append('sort', '-createdAt');
      else if (filters.sort === 'oldest') queryParams.append('sort', 'createdAt');
      else if (filters.sort === 'priceAsc') queryParams.append('sort', 'tokenPrice');
      else if (filters.sort === 'priceDesc') queryParams.append('sort', '-tokenPrice');
      else if (filters.sort === 'yieldDesc') queryParams.append('sort', '-expectedYield');

      // Fetch assets with filters
      const response = await fetch(`/api/assets?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      
      const data = await response.json();
      setAssets(data.assets);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // The search will be triggered by the useEffect when filters change
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Asset Marketplace</h1>
          <p className="text-gray-400">Discover and invest in tokenized real-world assets</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearchSubmit} className="w-full">
                <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">Search Assets</label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by title or location..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    🔍
                  </button>
                </div>
              </form>
            </div>
            
            <div>
              <label htmlFor="assetType" className="block text-sm font-medium text-gray-400 mb-1">Asset Type</label>
              <select
                id="assetType"
                name="assetType"
                value={filters.assetType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                <option value="real-estate">Real Estate</option>
                <option value="agriculture">Agriculture</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="equity">Equity</option>
                <option value="art">Art & Collectibles</option>
                <option value="commodity">Commodities</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-1">Status</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="funded">Fully Funded</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
              <select
                id="sort"
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="yieldDesc">Highest Yield</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Assets Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <span className="ml-3">Loading assets...</span>
          </div>
        ) : assets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map(asset => (
              <AssetCard key={asset._id} asset={asset} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400 mb-4">No assets found matching your criteria.</p>
            <button
              onClick={() => setFilters({
                assetType: 'all',
                status: 'all',
                search: '',
                sort: 'newest'
              })}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
