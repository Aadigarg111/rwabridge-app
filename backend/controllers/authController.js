const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');

// Environment variables would be loaded from .env in production
const JWT_SECRET = process.env.JWT_SECRET || 'rwabridge-jwt-secret-key';
const JWT_LIFETIME = process.env.JWT_LIFETIME || '30d';

// Register a new user
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    // Create user
    const user = await User.create({ name, email, password, role });
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_LIFETIME }
    );
    
    // Return user data (excluding password)
    res.status(StatusCodes.CREATED).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        kycVerified: user.kycVerified
      },
      token
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to register user',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Compare password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_LIFETIME }
    );
    
    // Return user data
    res.status(StatusCodes.OK).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        kycVerified: user.kycVerified
      },
      token
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to login',
      error: error.message
    });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to fetch user profile',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, walletAddress, profileImage } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (walletAddress) updateData.walletAddress = walletAddress;
    if (profileImage) updateData.profileImage = profileImage;
    
    updateData.updatedAt = Date.now();
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to update profile',
      error: error.message
    });
  }
};

// Connect wallet address
const connectWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Please provide wallet address'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { walletAddress, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to connect wallet',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  connectWallet
};
