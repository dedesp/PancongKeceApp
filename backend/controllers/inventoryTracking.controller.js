const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

class InventoryTrackingController {
  
  // Get current stock status for all raw materials
  async getCurrentStockStatus(req, res) {
    try {
      const { status, search, limit = 50, offset = 0 } = req.query;
      
      let whereClause = '';
      let params = [];
      
      if (status && status !== 'ALL') {
        whereClause += ' WHERE stock_status = ?';
        params.push(status);
      }
      
      if (search) {
        whereClause += (whereClause ? ' AND' : ' WHERE') + ' (name LIKE ? OR code LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }
      
      const query = `
        SELECT 
          raw_material_id,
          code,
          name,
          current_quantity,
          unit,
          minimum_stock,
          stock_status,
          last_updated,
          CASE 
            WHEN minimum_stock > 0 THEN (current_quantity / minimum_stock) * 100
            ELSE 100
          END as stock_percentage
        FROM current_stock_status
        ${whereClause}
        ORDER BY 
          CASE stock_status
            WHEN 'OUT_OF_STOCK' THEN 1
            WHEN 'LOW_STOCK' THEN 2
            ELSE 3
          END,
          name
        LIMIT ? OFFSET ?
      `;
      
      params.push(parseInt(limit), parseInt(offset));
      
      const stockData = await sequelize.query(query, {
        replacements: params,
        type: QueryTypes.SELECT
      });
      
      // Get summary counts
      const summaryQuery = `
        SELECT 
          stock_status,
          COUNT(*) as count
        FROM current_stock_status
        GROUP BY stock_status
      `;
      
      const summary = await sequelize.query(summaryQuery, {
        type: QueryTypes.SELECT
      });
      
      res.json({
        success: true,
        data: stockData,
        summary: summary.reduce((acc, item) => {
          acc[item.stock_status.toLowerCase()] = item.count;
          return acc;
        }, {}),
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: stockData.length
        }
      });
      
    } catch (error) {
      console.error('Error getting current stock status:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving stock status',
        error: error.message
      });
    }
  }
  
  // Get stock movements history
  async getStockMovements(req, res) {
    try {
      const { 
        materialId, 
        movementType, 
        referenceType,
        startDate, 
        endDate, 
        limit = 100, 
        offset = 0 
      } = req.query;
      
      let whereClause = '';
      let params = [];
      
      if (materialId) {
        whereClause += ' WHERE sm.raw_material_id = ?';
        params.push(materialId);
      }
      
      if (movementType) {
        whereClause += (whereClause ? ' AND' : ' WHERE') + ' sm.movement_type = ?';
        params.push(movementType);
      }
      
      if (referenceType) {
        whereClause += (whereClause ? ' AND' : ' WHERE') + ' sm.reference_type = ?';
        params.push(referenceType);
      }
      
      if (startDate) {
        whereClause += (whereClause ? ' AND' : ' WHERE') + ' DATE(sm.movement_date) >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        whereClause += (whereClause ? ' AND' : ' WHERE') + ' DATE(sm.movement_date) <= ?';
        params.push(endDate);
      }
      
      const query = `
        SELECT 
          sm.id,
          sm.raw_material_id,
          rm.code,
          rm.name as material_name,
          sm.movement_type,
          sm.quantity,
          sm.unit,
          sm.reference_type,
          sm.reference_id,
          sm.product_sold_id,
          p.name as product_name,
          sm.quantity_sold,
          sm.cost_per_unit,
          sm.total_cost,
          sm.notes,
          sm.movement_date
        FROM stock_movements sm
        JOIN raw_materials rm ON sm.raw_material_id = rm.id
        LEFT JOIN products p ON sm.product_sold_id = p.id
        ${whereClause}
        ORDER BY sm.movement_date DESC
        LIMIT ? OFFSET ?
      `;
      
      params.push(parseInt(limit), parseInt(offset));
      
      const movements = await sequelize.query(query, {
        replacements: params,
        type: QueryTypes.SELECT
      });
      
      res.json({
        success: true,
        data: movements,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
      
    } catch (error) {
      console.error('Error getting stock movements:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving stock movements',
        error: error.message
      });
    }
  }
  
  // Get daily sales summary
  async getDailySalesSummary(req, res) {
    try {
      const { startDate, endDate, limit = 30, offset = 0 } = req.query;
      
      let whereClause = '';
      let params = [];
      
      if (startDate) {
        whereClause += ' WHERE date >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        whereClause += (whereClause ? ' AND' : ' WHERE') + ' date <= ?';
        params.push(endDate);
      }
      
      const query = `
        SELECT 
          date,
          total_transactions,
          total_items_sold,
          gross_revenue,
          total_tax,
          total_discount,
          net_revenue,
          total_cogs,
          gross_profit,
          profit_margin_percent,
          average_transaction_value
        FROM daily_sales_analysis
        ${whereClause}
        ORDER BY date DESC
        LIMIT ? OFFSET ?
      `;
      
      params.push(parseInt(limit), parseInt(offset));
      
      const salesData = await sequelize.query(query, {
        replacements: params,
        type: QueryTypes.SELECT
      });
      
      res.json({
        success: true,
        data: salesData,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
      
    } catch (error) {
      console.error('Error getting daily sales summary:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving daily sales summary',
        error: error.message
      });
    }
  }
  
  // Get daily product sales
  async getDailyProductSales(req, res) {
    try {
      const { date, productId, limit = 50, offset = 0 } = req.query;
      
      let whereClause = '';
      let params = [];
      
      if (date) {
        whereClause += ' WHERE date = ?';
        params.push(date);
      }
      
      if (productId) {
        whereClause += (whereClause ? ' AND' : ' WHERE') + ' product_id = ?';
        params.push(productId);
      }
      
      const query = `
        SELECT 
          date,
          product_id,
          product_name,
          quantity_sold,
          unit_price,
          total_revenue,
          unit_cogs,
          total_cogs,
          unit_profit,
          total_profit,
          CASE 
            WHEN total_revenue > 0 THEN (total_profit / total_revenue) * 100
            ELSE 0
          END as profit_margin_percent
        FROM daily_product_sales
        ${whereClause}
        ORDER BY date DESC, total_profit DESC
        LIMIT ? OFFSET ?
      `;
      
      params.push(parseInt(limit), parseInt(offset));
      
      const productSales = await sequelize.query(query, {
        replacements: params,
        type: QueryTypes.SELECT
      });
      
      res.json({
        success: true,
        data: productSales,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
      
    } catch (error) {
      console.error('Error getting daily product sales:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving daily product sales',
        error: error.message
      });
    }
  }
  
  // Get product composition details
  async getProductComposition(req, res) {
    try {
      const { productId } = req.params;
      
      const query = `
        SELECT 
          product_id,
          product_name,
          sku,
          raw_material_id,
          raw_material_name,
          quantity_needed_per_portion,
          unit,
          source_type,
          pg_name
        FROM product_full_composition
        WHERE product_id = ?
        ORDER BY source_type, raw_material_name
      `;
      
      const composition = await sequelize.query(query, {
        replacements: [productId],
        type: QueryTypes.SELECT
      });
      
      if (composition.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product composition not found'
        });
      }
      
      // Calculate total COGS
      const cogsQuery = `
        SELECT total_cogs_per_portion
        FROM product_cogs_calculation
        WHERE product_id = ?
      `;
      
      const cogs = await sequelize.query(cogsQuery, {
        replacements: [productId],
        type: QueryTypes.SELECT
      });
      
      res.json({
        success: true,
        data: {
          product: {
            id: composition[0].product_id,
            name: composition[0].product_name,
            sku: composition[0].sku,
            total_cogs: cogs[0]?.total_cogs_per_portion || 0
          },
          composition: composition.map(item => ({
            raw_material_id: item.raw_material_id,
            raw_material_name: item.raw_material_name,
            quantity_needed: item.quantity_needed_per_portion,
            unit: item.unit,
            source_type: item.source_type,
            pg_name: item.pg_name
          }))
        }
      });
      
    } catch (error) {
      console.error('Error getting product composition:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving product composition',
        error: error.message
      });
    }
  }
  
  // Update stock manually (for adjustments)
  async updateStock(req, res) {
    try {
      const { rawMaterialId, quantity, movementType, notes } = req.body;
      
      if (!rawMaterialId || !quantity || !movementType) {
        return res.status(400).json({
          success: false,
          message: 'Raw material ID, quantity, and movement type are required'
        });
      }
      
      const transaction = await sequelize.transaction();
      
      try {
        // Insert stock movement
        await sequelize.query(`
          INSERT INTO stock_movements (
            raw_material_id, movement_type, quantity, unit, 
            reference_type, notes, created_by
          )
          SELECT 
            ?, ?, ?, rm.unit, 'ADJUSTMENT', ?, ?
          FROM raw_materials rm
          WHERE rm.id = ?
        `, {
          replacements: [
            rawMaterialId, movementType, quantity, 
            notes || 'Manual stock adjustment', 
            req.user?.id || 'system',
            rawMaterialId
          ],
          type: QueryTypes.INSERT,
          transaction
        });
        
        // Update current stock
        const updateQuery = movementType === 'IN' 
          ? 'UPDATE raw_material_stock SET current_quantity = current_quantity + ?, last_updated = CURRENT_TIMESTAMP WHERE raw_material_id = ?'
          : 'UPDATE raw_material_stock SET current_quantity = current_quantity - ?, last_updated = CURRENT_TIMESTAMP WHERE raw_material_id = ?';
        
        await sequelize.query(updateQuery, {
          replacements: [quantity, rawMaterialId],
          type: QueryTypes.UPDATE,
          transaction
        });
        
        await transaction.commit();
        
        res.json({
          success: true,
          message: 'Stock updated successfully'
        });
        
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
      
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating stock',
        error: error.message
      });
    }
  }
  
  // Get inventory dashboard data
  async getDashboardData(req, res) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Stock alerts
      const stockAlerts = await sequelize.query(`
        SELECT COUNT(*) as count, stock_status
        FROM current_stock_status
        WHERE stock_status IN ('LOW_STOCK', 'OUT_OF_STOCK')
        GROUP BY stock_status
      `, { type: QueryTypes.SELECT });
      
      // Today's sales summary
      const todaySales = await sequelize.query(`
        SELECT *
        FROM daily_sales_analysis
        WHERE date = ?
      `, {
        replacements: [today],
        type: QueryTypes.SELECT
      });
      
      // Top selling products today
      const topProducts = await sequelize.query(`
        SELECT product_name, quantity_sold, total_revenue, total_profit
        FROM daily_product_sales
        WHERE date = ?
        ORDER BY quantity_sold DESC
        LIMIT 5
      `, {
        replacements: [today],
        type: QueryTypes.SELECT
      });
      
      // Recent stock movements
      const recentMovements = await sequelize.query(`
        SELECT 
          rm.name as material_name,
          sm.movement_type,
          sm.quantity,
          sm.unit,
          sm.reference_type,
          sm.movement_date
        FROM stock_movements sm
        JOIN raw_materials rm ON sm.raw_material_id = rm.id
        ORDER BY sm.movement_date DESC
        LIMIT 10
      `, { type: QueryTypes.SELECT });
      
      res.json({
        success: true,
        data: {
          stockAlerts: stockAlerts.reduce((acc, item) => {
            acc[item.stock_status.toLowerCase()] = item.count;
            return acc;
          }, { low_stock: 0, out_of_stock: 0 }),
          todaySales: todaySales[0] || {
            total_transactions: 0,
            total_items_sold: 0,
            net_revenue: 0,
            gross_profit: 0,
            profit_margin_percent: 0
          },
          topProducts,
          recentMovements
        }
      });
      
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving dashboard data',
        error: error.message
      });
    }
  }
  
  // Calculate potential sales based on current stock
  async getPotentialSales(req, res) {
    try {
      const query = `
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.sku,
          MIN(
            CASE 
              WHEN pfc.quantity_needed_per_portion > 0 
              THEN FLOOR(rms.current_quantity / pfc.quantity_needed_per_portion)
              ELSE 999999
            END
          ) as max_possible_sales,
          GROUP_CONCAT(
            rm.name || ': ' || rms.current_quantity || ' ' || rms.unit ||
            ' (need: ' || pfc.quantity_needed_per_portion || ' ' || pfc.unit || ')'
          ) as limiting_factors
        FROM products p
        JOIN product_full_composition pfc ON p.id = pfc.product_id
        JOIN raw_material_stock rms ON pfc.raw_material_id = rms.raw_material_id
        JOIN raw_materials rm ON rms.raw_material_id = rm.id
        WHERE p.sku NOT LIKE 'PG%'
        GROUP BY p.id, p.name, p.sku
        HAVING max_possible_sales < 50
        ORDER BY max_possible_sales ASC
      `;
      
      const potentialSales = await sequelize.query(query, {
        type: QueryTypes.SELECT
      });
      
      res.json({
        success: true,
        data: potentialSales
      });
      
    } catch (error) {
      console.error('Error calculating potential sales:', error);
      res.status(500).json({
        success: false,
        message: 'Error calculating potential sales',
        error: error.message
      });
    }
  }
}

module.exports = new InventoryTrackingController();