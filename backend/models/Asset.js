const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an asset title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  assetType: {
    type: String,
    required: [true, 'Please specify asset type'],
    enum: ['real-estate', 'agriculture', 'infrastructure', 'equity', 'art', 'commodity', 'other'],
  },
  location: {
    type: String,
    required: [true, 'Please provide asset location'],
    trim: true
  },
  totalValue: {
    type: Number,
    required: [true, 'Please provide total asset value']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  tokenSymbol: {
    type: String,
    required: [true, 'Please provide token symbol'],
    trim: true,
    uppercase: true
  },
  totalTokens: {
    type: Number,
    required: [true, 'Please provide total number of tokens']
  },
  tokenPrice: {
    type: Number,
    required: [true, 'Please provide token price']
  },
  minInvestment: {
    type: Number,
    required: [true, 'Please provide minimum investment amount']
  },
  expectedYield: {
    type: Number,
    default: 0
  },
  images: [{
    type: String
  }],
  documents: [{
    title: String,
    fileUrl: String,
    fileType: String
  }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'funded', 'completed', 'cancelled'],
    default: 'draft'
  },
  tokenizationStatus: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  contractAddress: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tokensOwned: {
      type: Number,
      default: 0
    },
    investmentAmount: {
      type: Number,
      default: 0
    },
    investmentDate: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
AssetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Asset', AssetSchema);
