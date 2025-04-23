require('dotenv').config();
const { StatusCodes } = require('http-status-codes');
const Asset = require('../models/Asset');

// Get all assets
const getAllAssets = async (req, res) => {
  try {
    const { assetType, status, sort, search } = req.query;
    const queryObject = {};
    
    // Filter by asset type
    if (assetType && assetType !== 'all') {
      queryObject.assetType = assetType;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      queryObject.status = status;
    }
    
    // Search by title or location
    if (search) {
      queryObject.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Create query
    let result = Asset.find(queryObject);
    
    // Sort
    if (sort) {
      const sortList = sort.split(',').join(' ');
      result = result.sort(sortList);
    } else {
      result = result.sort('-createdAt');
    }
    
    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    result = result.skip(skip).limit(limit);
    
    // Execute query
    const assets = await result.populate('owner', 'name email');
    
    // Get total count
    const totalAssets = await Asset.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalAssets / limit);
    
    res.status(StatusCodes.OK).json({
      success: true,
      assets,
      totalAssets,
      numOfPages
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to fetch assets',
      error: error.message
    });
  }
};

// Get single asset
const getAsset = async (req, res) => {
  try {
    const { id: assetId } = req.params;
    
    const asset = await Asset.findById(assetId)
      .populate('owner', 'name email walletAddress')
      .populate('investors.user', 'name email walletAddress');
    
    if (!asset) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No asset found with id ${assetId}`
      });
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      asset
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to fetch asset',
      error: error.message
    });
  }
};

// Create asset
const createAsset = async (req, res) => {
  try {
    // Add owner to request body
    req.body.owner = req.user.userId;
    
    const asset = await Asset.create(req.body);
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      asset
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to create asset',
      error: error.message
    });
  }
};

// Update asset
const updateAsset = async (req, res) => {
  try {
    const { id: assetId } = req.params;
    
    // Find asset
    const asset = await Asset.findById(assetId);
    
    if (!asset) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No asset found with id ${assetId}`
      });
    }
    
    // Check ownership or admin role
    if (asset.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Not authorized to update this asset'
      });
    }
    
    // Update asset
    const updatedAsset = await Asset.findByIdAndUpdate(
      assetId,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(StatusCodes.OK).json({
      success: true,
      asset: updatedAsset
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to update asset',
      error: error.message
    });
  }
};

// Delete asset
const deleteAsset = async (req, res) => {
  try {
    const { id: assetId } = req.params;
    
    // Find asset
    const asset = await Asset.findById(assetId);
    
    if (!asset) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No asset found with id ${assetId}`
      });
    }
    
    // Check ownership or admin role
    if (asset.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Not authorized to delete this asset'
      });
    }
    
    // Delete asset
    await asset.remove();
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Asset successfully deleted'
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to delete asset',
      error: error.message
    });
  }
};

// Get user's assets
const getUserAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ owner: req.user.userId }).sort('-createdAt');
    
    res.status(StatusCodes.OK).json({
      success: true,
      count: assets.length,
      assets
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to fetch user assets',
      error: error.message
    });
  }
};

// Get user's investments
const getUserInvestments = async (req, res) => {
  try {
    const assets = await Asset.find({
      'investors.user': req.user.userId
    }).sort('-createdAt');
    
    res.status(StatusCodes.OK).json({
      success: true,
      count: assets.length,
      assets
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to fetch user investments',
      error: error.message
    });
  }
};

// Invest in asset
const investInAsset = async (req, res) => {
  try {
    const { id: assetId } = req.params;
    const { tokensAmount, investmentAmount } = req.body;
    
    if (!tokensAmount || !investmentAmount) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Please provide tokens amount and investment amount'
      });
    }
    
    // Find asset
    const asset = await Asset.findById(assetId);
    
    if (!asset) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No asset found with id ${assetId}`
      });
    }
    
    // Check if asset is active
    if (asset.status !== 'active') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'This asset is not available for investment'
      });
    }
    
    // Check if user is already an investor
    const existingInvestorIndex = asset.investors.findIndex(
      investor => investor.user.toString() === req.user.userId
    );
    
    if (existingInvestorIndex !== -1) {
      // Update existing investment
      asset.investors[existingInvestorIndex].tokensOwned += Number(tokensAmount);
      asset.investors[existingInvestorIndex].investmentAmount += Number(investmentAmount);
      asset.investors[existingInvestorIndex].investmentDate = Date.now();
    } else {
      // Add new investor
      asset.investors.push({
        user: req.user.userId,
        tokensOwned: Number(tokensAmount),
        investmentAmount: Number(investmentAmount),
        investmentDate: Date.now()
      });
    }
    
    // Save asset
    await asset.save();
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Investment successful',
      asset
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to process investment',
      error: error.message
    });
  }
};

// Update asset tokenization status
const updateTokenizationStatus = async (req, res) => {
  try {
    const { id: assetId } = req.params;
    const { tokenizationStatus, contractAddress } = req.body;
    
    if (!tokenizationStatus) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Please provide tokenization status'
      });
    }
    
    // Find asset
    const asset = await Asset.findById(assetId);
    
    if (!asset) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No asset found with id ${assetId}`
      });
    }
    
    // Check ownership or admin role
    if (asset.owner.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Not authorized to update this asset'
      });
    }
    
    // Update tokenization status
    asset.tokenizationStatus = tokenizationStatus;
    
    // Update contract address if provided
    if (contractAddress) {
      asset.contractAddress = contractAddress;
    }
    
    // If tokenization is completed, update asset status to active
    if (tokenizationStatus === 'completed') {
      asset.status = 'active';
    }
    
    // Save asset
    await asset.save();
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Tokenization status updated',
      asset
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to update tokenization status',
      error: error.message
    });
  }
};

module.exports = {
  getAllAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  getUserAssets,
  getUserInvestments,
  investInAsset,
  updateTokenizationStatus
};
