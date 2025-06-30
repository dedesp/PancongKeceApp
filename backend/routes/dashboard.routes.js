const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get dashboard statistics
router.get('/stats', authenticate, logActivity('dashboard'), dashboardController.getDashboardStats);

// Get recent transactions
router.get('/recent-transactions', authenticate, logActivity('dashboard'), dashboardController.getRecentTransactions);

// Get top selling products
router.get('/top-products', authenticate, logActivity('dashboard'), dashboardController.getTopProducts);

module.exports = router;