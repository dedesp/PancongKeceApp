const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discount.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get all discounts (manager/admin only)
router.get('/', authenticate, authorize('manager', 'admin'), logActivity('discount'), discountController.getAllDiscounts);

// Get active discounts (both roles can access)
router.get('/active', authenticate, logActivity('discount'), discountController.getActiveDiscounts);

// Validate discount code (both roles can access)
router.post('/validate', authenticate, logActivity('discount'), discountController.validateDiscount);

// Create discount (manager/admin only)
router.post('/', authenticate, authorize('manager', 'admin'), logActivity('discount'), discountController.createDiscount);

// Update discount (manager/admin only)
router.put('/:id', authenticate, authorize('manager', 'admin'), logActivity('discount'), discountController.updateDiscount);

// Delete discount (manager/admin only)
router.delete('/:id', authenticate, authorize('manager', 'admin'), logActivity('discount'), discountController.deleteDiscount);

module.exports = router;