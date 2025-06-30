const express = require('express');
const router = express.Router();
const { Payroll, Employee, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get payroll records
router.get('/', authenticate, authorize('manager', 'admin'), logActivity('payroll'), async (req, res) => {
  try {
    const payroll = await Payroll.findAll({
      include: [{
        model: Employee,
        include: [{
          model: User,
          attributes: ['username', 'email']
        }]
      }]
    });
    
    res.json({
      status: 'success',
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data payroll',
      error: error.message
    });
  }
});

module.exports = router;
