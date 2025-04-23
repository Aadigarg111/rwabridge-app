const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticateUser, authorizeAssetOwner } = require('../middleware/auth');

// Public routes
router.get('/', assetController.getAllAssets);
router.get('/:id', assetController.getAsset);

// Protected routes
router.post('/', authenticateUser, authorizeAssetOwner, assetController.createAsset);
router.patch('/:id', authenticateUser, assetController.updateAsset);
router.delete('/:id', authenticateUser, assetController.deleteAsset);
router.get('/user/assets', authenticateUser, assetController.getUserAssets);
router.get('/user/investments', authenticateUser, assetController.getUserInvestments);
router.post('/:id/invest', authenticateUser, assetController.investInAsset);
router.patch('/:id/tokenization', authenticateUser, authorizeAssetOwner, assetController.updateTokenizationStatus);

module.exports = router;
