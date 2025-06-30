const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automation.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get automation rules (manager/admin only)
router.get('/rules', authenticate, authorize('manager', 'admin'), logActivity('automation'), automationController.getAutomationRules);

// Create automation rule (manager/admin only)
router.post('/rules', authenticate, authorize('manager', 'admin'), logActivity('automation'), automationController.createAutomationRule);

// Execute automation rule manually (manager/admin only)
router.post('/rules/:id/execute', authenticate, authorize('manager', 'admin'), logActivity('automation'), automationController.executeAutomationRule);

// Process birthday automation (system/admin only)
router.post('/birthday', authenticate, authorize('admin'), logActivity('automation'), automationController.processBirthdayAutomation);

module.exports = router;