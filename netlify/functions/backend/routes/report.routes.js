const express = require('express');
const router = express.Router();
const { Transaction, Product, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get reports
router.get('/sales', authenticate, authorize('manager', 'admin'), logActivity('report'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const salesReport = await Transaction.findAll({
      where: startDate && endDate ? {
        created_at: {
          [require('sequelize').Op.between]: [startDate, endDate]
        }
      } : {},
      include: [{
        model: User,
        as: 'Cashier',
        attributes: ['username']
      }]
    });
    
    res.json({
      status: 'success',
      data: salesReport
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil laporan penjualan',
      error: error.message
    });
  }
});

module.exports = router;
