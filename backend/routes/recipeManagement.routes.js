const express = require('express');
const router = express.Router();
const RecipeManagementController = require('../controllers/recipeManagement.controller');

// ==================== PRODUCT ROUTES ====================

/**
 * @route GET /api/recipe-management/products
 * @desc Get all products with recipes and costs
 * @query category, search, page, limit
 */
router.get('/products', RecipeManagementController.getAllProducts);

/**
 * @route GET /api/recipe-management/products/:id
 * @desc Get product detail with cost breakdown
 * @param id - Product ID
 */
router.get('/products/:id', RecipeManagementController.getProductDetail);

// ==================== RECIPE ROUTES ====================

/**
 * @route GET /api/recipe-management/recipes
 * @desc Get all recipes
 * @query category, search, page, limit
 */
router.get('/recipes', RecipeManagementController.getAllRecipes);

// ==================== INVENTORY ROUTES ====================

/**
 * @route GET /api/recipe-management/inventory/stock
 * @desc Get current stock levels
 * @query category, lowStock, search, page, limit
 */
router.get('/inventory/stock', RecipeManagementController.getCurrentStock);

/**
 * @route GET /api/recipe-management/inventory/alerts
 * @desc Get stock alerts
 * @query type, resolved
 */
router.get('/inventory/alerts', RecipeManagementController.getStockAlerts);

// ==================== SALES ROUTES ====================

/**
 * @route POST /api/recipe-management/sales/process
 * @desc Process sale and auto-deduct inventory
 * @body { items: [{ productId, quantity, unitPrice }], customerId, paymentMethod, cashierId, notes }
 */
router.post('/sales/process', RecipeManagementController.processSale);

// ==================== REPORTING ROUTES ====================

/**
 * @route GET /api/recipe-management/reports/daily-stock-usage
 * @desc Get daily stock usage report
 * @query date
 */
router.get('/reports/daily-stock-usage', RecipeManagementController.getDailyStockUsage);

/**
 * @route GET /api/recipe-management/reports/cost-revenue-analysis
 * @desc Get cost vs revenue analysis
 * @query startDate, endDate
 */
router.get('/reports/cost-revenue-analysis', RecipeManagementController.getCostRevenueAnalysis);

module.exports = router;