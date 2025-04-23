const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticateUser, authController.getCurrentUser);
router.patch('/update-profile', authenticateUser, authController.updateProfile);
router.post('/connect-wallet', authenticateUser, authController.connectWallet);

module.exports = router;
