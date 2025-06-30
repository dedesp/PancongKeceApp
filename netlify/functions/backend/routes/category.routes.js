const express = require('express');
const router = express.Router();
const { Category, Product } = require('../models');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { logActivity } = require('../middleware/logger.middleware');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{
        model: Product,
        attributes: ['id', 'name']
      }]
    });
    
    res.json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data kategori',
      error: error.message
    });
  }
});

// Create new category
router.post('/', authenticate, authorize('manager', 'admin'), logActivity('category'), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const category = await Category.create({
      name,
      description
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Kategori berhasil dibuat',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal membuat kategori',
      error: error.message
    });
  }
});

// Update category
router.put('/:id', authenticate, authorize('manager', 'admin'), logActivity('category'), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Kategori tidak ditemukan'
      });
    }
    
    await category.update({ name, description });
    
    res.json({
      status: 'success',
      message: 'Kategori berhasil diperbarui',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui kategori',
      error: error.message
    });
  }
});

// Delete category
router.delete('/:id', authenticate, authorize('manager', 'admin'), logActivity('category'), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Kategori tidak ditemukan'
      });
    }
    
    await category.destroy();
    
    res.json({
      status: 'success',
      message: 'Kategori berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus kategori',
      error: error.message
    });
  }
});

module.exports = router;
