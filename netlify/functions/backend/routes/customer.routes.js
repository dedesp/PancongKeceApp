const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get all customers (manager/admin only)
router.get('/', authenticate, authorize('manager', 'admin'), logActivity('customer'), customerController.getAllCustomers);

// Search customer by phone or code (both roles can access)
router.get('/search', authenticate, logActivity('customer'), customerController.searchCustomer);

// Create customer (both roles can access)
router.post('/', authenticate, logActivity('customer'), customerController.createCustomer);

// Update customer (manager/admin only)
router.put('/:id', authenticate, authorize('manager', 'admin'), logActivity('customer'), customerController.updateCustomer);

// Get customer transactions (manager/admin only)
router.get('/:id/transactions', authenticate, authorize('manager', 'admin'), logActivity('customer'), customerController.getCustomerTransactions);

// Get customer point history (manager/admin only)
router.get('/:id/points', authenticate, authorize('manager', 'admin'), logActivity('customer'), customerController.getCustomerPointHistory);

module.exports = router;