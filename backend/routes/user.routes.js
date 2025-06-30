const express = require('express');
const router = express.Router();
const { User, Role } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get all users
router.get('/', authenticate, authorize('manager', 'admin'), logActivity('user'), async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Role,
        attributes: ['name']
      }],
      attributes: { exclude: ['password'] }
    });
    
    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data pengguna',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/:id', authenticate, logActivity('user'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{
        model: Role,
        attributes: ['name']
      }],
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Pengguna tidak ditemukan'
      });
    }
    
    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data pengguna',
      error: error.message
    });
  }
});

module.exports = router;
