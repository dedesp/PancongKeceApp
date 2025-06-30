const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get all transactions (both roles but with filtered data)
router.get('/', authenticate, logActivity('transaction'), transactionController.getAllTransactions);

// Get transaction by ID (both roles)
router.get('/:id', authenticate, logActivity('transaction'), transactionController.getTransactionById);

// Create transaction (both roles)
router.post('/', authenticate, logActivity('transaction'), transactionController.createTransaction);

// Update transaction (for receipt printing status) (both roles)
router.put('/:id', authenticate, logActivity('transaction'), transactionController.updateTransaction);

// Cancel transaction (manager only)
router.put('/:id/cancel', authenticate, authorize('manager', 'admin'), logActivity('transaction'), transactionController.cancelTransaction);

module.exports = router;