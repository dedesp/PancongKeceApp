const express = require('express');
const router = express.Router();
const { Attendance, Employee, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get attendance records
router.get('/', authenticate, authorize('manager', 'admin'), logActivity('attendance'), async (req, res) => {
  try {
    const attendance = await Attendance.findAll({
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
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data absensi',
      error: error.message
    });
  }
});

module.exports = router;
