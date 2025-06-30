const express = require('express');
const router = express.Router();
const roundingSettingController = require('../controllers/roundingSetting.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get rounding settings (both roles can access for calculation)
router.get('/', authenticate, logActivity('rounding_setting'), roundingSettingController.getRoundingSettings);

// Update rounding settings (manager/admin only)
router.put('/', authenticate, authorize('manager', 'admin'), logActivity('rounding_setting'), roundingSettingController.updateRoundingSettings);

// Apply rounding to amount (both roles can access)
router.post('/apply', authenticate, logActivity('rounding_setting'), roundingSettingController.applyRounding);

module.exports = router;