const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Public routes
router.post('/login', logActivity('auth'), authController.login);

// Protected routes
router.post('/register', authenticate, authorize('manager', 'admin'), logActivity('auth'), authController.register);
router.get('/profile', authenticate, logActivity('auth'), authController.getProfile);
router.post('/change-password', authenticate, logActivity('auth'), authController.updatePassword);
router.post('/logout', authenticate, logActivity('auth'), authController.logout);

module.exports = router;