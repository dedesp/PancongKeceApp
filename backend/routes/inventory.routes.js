const express = require('express');
const router = express.Router();
const { Inventory, Product } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get all inventory
router.get('/', authenticate, logActivity('inventory'), async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      include: [{
        model: Product,
        attributes: ['name', 'sku']
      }]
    });
    
    res.json({
      status: 'success',
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data inventory',
      error: error.message
    });
  }
});

// Update stock
router.put('/:id/stock', authenticate, authorize('manager', 'admin'), logActivity('inventory'), async (req, res) => {
  try {
    const { stock } = req.body;
    
    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        status: 'error',
        message: 'Item inventory tidak ditemukan'
      });
    }
    
    await inventory.update({ stock });
    
    res.json({
      status: 'success',
      message: 'Stock berhasil diperbarui',
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui stock',
      error: error.message
    });
  }
});

module.exports = router;
