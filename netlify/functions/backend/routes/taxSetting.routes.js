const express = require('express');
const router = express.Router();
const taxSettingController = require('../controllers/taxSetting.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get all tax settings (manager/admin only)
router.get('/', authenticate, authorize('manager', 'admin'), logActivity('tax_setting'), taxSettingController.getAllTaxSettings);

// Get active tax settings (both roles can access for calculation)
router.get('/active', authenticate, logActivity('tax_setting'), taxSettingController.getActiveTaxSettings);

// Update tax setting (manager/admin only)
router.put('/:id', authenticate, authorize('manager', 'admin'), logActivity('tax_setting'), taxSettingController.updateTaxSetting);

// Calculate tax and service for transaction (both roles)
router.post('/calculate', authenticate, logActivity('tax_setting'), taxSettingController.calculateTaxAndService);

module.exports = router;