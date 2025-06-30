const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get all products (both roles can access)
router.get('/', authenticate, logActivity('product'), productController.getAllProducts);

// Get product by ID (both roles can access)
router.get('/:id', authenticate, logActivity('product'), productController.getProductById);

// Manager only routes
router.post('/', authenticate, authorize('manager', 'admin'), logActivity('product'), productController.createProduct);
router.put('/:id', authenticate, authorize('manager', 'admin'), logActivity('product'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('manager', 'admin'), logActivity('product'), productController.deleteProduct);

module.exports = router;