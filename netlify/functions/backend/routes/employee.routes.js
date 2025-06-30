const express = require('express');
const router = express.Router();
const { Employee, User, Role } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get all employees
router.get('/', authenticate, authorize('manager', 'admin'), logActivity('employee'), async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [{
        model: User,
        include: [{
          model: Role,
          attributes: ['name']
        }],
        attributes: { exclude: ['password'] }
      }]
    });
    
    res.json({
      status: 'success',
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data karyawan',
      error: error.message
    });
  }
});

module.exports = router;
