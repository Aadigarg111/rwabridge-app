const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');

// Mock transaction data for simulation
const simulateTransaction = async (req, res) => {
  try {
    const { assetId, tokenAmount, transactionType } = req.body;
    
    if (!assetId || !tokenAmount || !transactionType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide assetId, tokenAmount, and transactionType'
      });
    }
    
    // Simulate transaction processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate transaction hash
    const transactionHash = 'sol_' + Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);
    
    // Return simulated transaction result
    res.status(200).json({
      success: true,
      transaction: {
        id: Math.random().toString(36).substring(2, 10),
        assetId,
        userId: req.user.userId,
        tokenAmount: Number(tokenAmount),
        transactionType,
        transactionHash,
        status: 'completed',
        timestamp: new Date(),
        fee: (0.000005 * Number(tokenAmount)).toFixed(6)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Transaction simulation failed',
      error: error.message
    });
  }
};

// Get wallet balance simulation
const getWalletBalance = async (req, res) => {
  try {
    // Simulate wallet balance
    res.status(200).json({
      success: true,
      balance: {
        sol: (Math.random() * 10).toFixed(4),
        usdc: (Math.random() * 1000).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet balance',
      error: error.message
    });
  }
};

// Simulate tokenization process
const simulateTokenization = async (req, res) => {
  try {
    const { assetId } = req.params;
    
    if (!assetId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide assetId'
      });
    }
    
    // Simulate tokenization processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate contract address
    const contractAddress = 'sol' + Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);
    
    // Return simulated tokenization result
    res.status(200).json({
      success: true,
      tokenization: {
        assetId,
        contractAddress,
        status: 'completed',
        timestamp: new Date(),
        transactionHash: 'sol_' + Math.random().toString(36).substring(2, 15)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Tokenization simulation failed',
      error: error.message
    });
  }
};

// Get transaction history
const getTransactionHistory = async (req, res) => {
  try {
    // Generate random number of transactions
    const transactionCount = Math.floor(Math.random() * 10) + 1;
    const transactions = [];
    
    // Generate mock transaction history
    for (let i = 0; i < transactionCount; i++) {
      const transactionType = Math.random() > 0.5 ? 'buy' : 'sell';
      const tokenAmount = (Math.random() * 100).toFixed(2);
      
      transactions.push({
        id: Math.random().toString(36).substring(2, 10),
        assetId: Math.random().toString(36).substring(2, 10),
        userId: req.user.userId,
        tokenAmount: Number(tokenAmount),
        transactionType,
        transactionHash: 'sol_' + Math.random().toString(36).substring(2, 15),
        status: 'completed',
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        fee: (0.000005 * Number(tokenAmount)).toFixed(6)
      });
    }
    
    // Sort by timestamp (newest first)
    transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    res.status(200).json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction history',
      error: error.message
    });
  }
};

// Routes
router.post('/simulate-transaction', authenticateUser, simulateTransaction);
router.get('/wallet-balance', authenticateUser, getWalletBalance);
router.post('/tokenize/:assetId', authenticateUser, simulateTokenization);
router.get('/transaction-history', authenticateUser, getTransactionHistory);

module.exports = router;
