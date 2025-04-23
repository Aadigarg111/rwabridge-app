const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

// Environment variables would be loaded from .env in production
const JWT_SECRET = process.env.JWT_SECRET || 'rwabridge-jwt-secret-key';

const authenticateUser = async (req, res, next) => {
  // Check header for token
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication invalid'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Attach user to request object
    req.user = {
      userId: payload.userId,
      name: payload.name,
      role: payload.role
    };
    
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication invalid'
    });
  }
};

// Middleware to check if user has admin role
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
  next();
};

// Middleware to check if user is asset owner or admin
const authorizeAssetOwner = (req, res, next) => {
  if (req.user.role !== 'asset-owner' && req.user.role !== 'admin') {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
  next();
};

module.exports = {
  authenticateUser,
  authorizeAdmin,
  authorizeAssetOwner
};
