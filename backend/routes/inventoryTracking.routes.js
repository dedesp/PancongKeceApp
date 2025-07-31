const express = require('express');
const router = express.Router();
const inventoryTrackingController = require('../controllers/inventoryTracking.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
// router.use(authMiddleware.authenticate);

/**
 * @route GET /api/inventory-tracking/stock-status
 * @desc Get current stock status for all raw materials
 * @access Private
 * @query {
 *   status?: 'NORMAL' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'ALL',
 *   search?: string,
 *   limit?: number,
 *   offset?: number
 * }
 */
router.get('/stock-status', inventoryTrackingController.getCurrentStockStatus);

/**
 * @route GET /api/inventory-tracking/stock-movements
 * @desc Get stock movements history
 * @access Private
 * @query {
 *   materialId?: number,
 *   movementType?: 'IN' | 'OUT',
 *   referenceType?: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'PRODUCTION',
 *   startDate?: string (YYYY-MM-DD),
 *   endDate?: string (YYYY-MM-DD),
 *   limit?: number,
 *   offset?: number
 * }
 */
router.get('/stock-movements', inventoryTrackingController.getStockMovements);

/**
 * @route GET /api/inventory-tracking/daily-sales
 * @desc Get daily sales summary
 * @access Private
 * @query {
 *   startDate?: string (YYYY-MM-DD),
 *   endDate?: string (YYYY-MM-DD),
 *   limit?: number,
 *   offset?: number
 * }
 */
router.get('/daily-sales', inventoryTrackingController.getDailySalesSummary);

/**
 * @route GET /api/inventory-tracking/product-sales
 * @desc Get daily product sales
 * @access Private
 * @query {
 *   date?: string (YYYY-MM-DD),
 *   productId?: string,
 *   limit?: number,
 *   offset?: number
 * }
 */
router.get('/product-sales', inventoryTrackingController.getDailyProductSales);

/**
 * @route GET /api/inventory-tracking/product-composition/:productId
 * @desc Get product composition details
 * @access Private
 * @param {string} productId - Product ID
 */
router.get('/product-composition/:productId', inventoryTrackingController.getProductComposition);

/**
 * @route PUT /api/inventory-tracking/update-stock
 * @desc Update stock manually (for adjustments)
 * @access Private
 * @body {
 *   rawMaterialId: number,
 *   quantity: number,
 *   movementType: 'IN' | 'OUT',
 *   notes?: string
 * }
 */
router.put('/update-stock', inventoryTrackingController.updateStock);

/**
 * @route GET /api/inventory-tracking/dashboard
 * @desc Get inventory dashboard data
 * @access Private
 */
router.get('/dashboard', inventoryTrackingController.getDashboardData);

/**
 * @route GET /api/inventory-tracking/potential-sales
 * @desc Calculate potential sales based on current stock
 * @access Private
 */
router.get('/potential-sales', inventoryTrackingController.getPotentialSales);

// Additional utility routes

/**
 * @route GET /api/inventory-tracking/alerts
 * @desc Get stock alerts (low stock and out of stock items)
 * @access Private
 */
router.get('/alerts', async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const { QueryTypes } = require('sequelize');
    
    const alerts = await sequelize.query(`
      SELECT 
        raw_material_id,
        code,
        name,
        current_quantity,
        unit,
        minimum_stock,
        stock_status,
        last_updated
      FROM current_stock_status
      WHERE stock_status IN ('LOW_STOCK', 'OUT_OF_STOCK')
      ORDER BY 
        CASE stock_status
          WHEN 'OUT_OF_STOCK' THEN 1
          WHEN 'LOW_STOCK' THEN 2
        END,
        name
    `, { type: QueryTypes.SELECT });
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
    
  } catch (error) {
    console.error('Error getting stock alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving stock alerts',
      error: error.message
    });
  }
});

/**
 * @route GET /api/inventory-tracking/reports/daily-summary
 * @desc Get comprehensive daily summary report
 * @access Private
 * @query {
 *   date?: string (YYYY-MM-DD)
 * }
 */
router.get('/reports/daily-summary', async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    const { sequelize } = require('../config/database');
    const { QueryTypes } = require('sequelize');
    
    // Sales summary
    const salesSummary = await sequelize.query(`
      SELECT * FROM daily_sales_analysis WHERE date = ?
    `, {
      replacements: [date],
      type: QueryTypes.SELECT
    });
    
    // Product sales
    const productSales = await sequelize.query(`
      SELECT 
        product_name,
        quantity_sold,
        total_revenue,
        total_cogs,
        total_profit,
        profit_margin_percent
      FROM daily_product_sales
      WHERE date = ?
      ORDER BY total_profit DESC
    `, {
      replacements: [date],
      type: QueryTypes.SELECT
    });
    
    // Stock movements
    const stockMovements = await sequelize.query(`
      SELECT 
        rm.name as material_name,
        sm.movement_type,
        SUM(sm.quantity) as total_quantity,
        sm.unit,
        SUM(sm.total_cost) as total_cost
      FROM stock_movements sm
      JOIN raw_materials rm ON sm.raw_material_id = rm.id
      WHERE DATE(sm.movement_date) = ?
      GROUP BY rm.name, sm.movement_type, sm.unit
      ORDER BY rm.name, sm.movement_type
    `, {
      replacements: [date],
      type: QueryTypes.SELECT
    });
    
    res.json({
      success: true,
      data: {
        date,
        salesSummary: salesSummary[0] || null,
        productSales,
        stockMovements
      }
    });
    
  } catch (error) {
    console.error('Error generating daily summary report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating daily summary report',
      error: error.message
    });
  }
});

/**
 * @route GET /api/inventory-tracking/reports/inventory-valuation
 * @desc Get current inventory valuation
 * @access Private
 */
router.get('/reports/inventory-valuation', async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const { QueryTypes } = require('sequelize');
    
    const valuation = await sequelize.query(`
      SELECT 
        rms.raw_material_id,
        rm.code,
        rm.name,
        rms.current_quantity,
        rms.unit,
        rm.current_price,
        (rms.current_quantity * rm.current_price) as total_value,
        rms.stock_status
      FROM raw_material_stock rms
      JOIN raw_materials rm ON rms.raw_material_id = rm.id
      JOIN current_stock_status css ON rms.raw_material_id = css.raw_material_id
      ORDER BY total_value DESC
    `, { type: QueryTypes.SELECT });
    
    const totalValue = valuation.reduce((sum, item) => sum + (item.total_value || 0), 0);
    
    res.json({
      success: true,
      data: {
        items: valuation,
        totalValue,
        summary: {
          totalItems: valuation.length,
          totalValue,
          averageValue: valuation.length > 0 ? totalValue / valuation.length : 0
        }
      }
    });
    
  } catch (error) {
    console.error('Error generating inventory valuation:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating inventory valuation',
      error: error.message
    });
  }
});

/**
 * @route GET /api/inventory-tracking/analytics/profit-trends
 * @desc Get profit trends over time
 * @access Private
 * @query {
 *   days?: number (default: 30)
 * }
 */
router.get('/analytics/profit-trends', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const { sequelize } = require('../config/database');
    const { QueryTypes } = require('sequelize');
    
    const trends = await sequelize.query(`
      SELECT 
        date,
        net_revenue,
        total_cogs,
        gross_profit,
        profit_margin_percent,
        total_transactions,
        total_items_sold
      FROM daily_sales_analysis
      WHERE date >= date('now', '-${parseInt(days)} days')
      ORDER BY date ASC
    `, { type: QueryTypes.SELECT });
    
    // Calculate averages
    const avgRevenue = trends.reduce((sum, day) => sum + (day.net_revenue || 0), 0) / trends.length;
    const avgProfit = trends.reduce((sum, day) => sum + (day.gross_profit || 0), 0) / trends.length;
    const avgMargin = trends.reduce((sum, day) => sum + (day.profit_margin_percent || 0), 0) / trends.length;
    
    res.json({
      success: true,
      data: {
        trends,
        summary: {
          totalDays: trends.length,
          averageRevenue: avgRevenue,
          averageProfit: avgProfit,
          averageMargin: avgMargin
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting profit trends:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profit trends',
      error: error.message
    });
  }
});

module.exports = router;