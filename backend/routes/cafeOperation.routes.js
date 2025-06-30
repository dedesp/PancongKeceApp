const express = require('express');
const router = express.Router();
const cafeOperationController = require('../controllers/cafeOperation.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get today's operation status (both roles can access)
router.get('/status', authenticate, logActivity('cafe_operation'), cafeOperationController.getTodayOperationStatus);

// Open cafe (both roles can access)
router.post('/open', authenticate, logActivity('cafe_operation'), cafeOperationController.openCafe);

// Close cafe (both roles can access)
router.post('/close', authenticate, logActivity('cafe_operation'), cafeOperationController.closeCafe);

// Get operation history (manager/admin only)
router.get('/history', authenticate, logActivity('cafe_operation'), cafeOperationController.getOperationHistory);

module.exports = router;