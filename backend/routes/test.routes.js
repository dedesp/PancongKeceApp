const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const {
  RawMaterial,
  ProductCategory,
  RecipeProduct,
  Recipe,
  RecipeIngredient,
  CurrentStock,
  InventoryTransaction,
  SalesTransaction,
  SalesTransactionDetail,
  StockAlert
} = require('../models/RecipeManagement');

// Test database connection and tables
router.get('/db-status', async (req, res) => {
  try {
    // Test connection
    await sequelize.authenticate();
    
    // Check if tables exist and get counts
    const tableStatus = {};
    
    try {
      tableStatus.rawMaterials = await RawMaterial.count();
    } catch (e) {
      tableStatus.rawMaterials = 'Table not found: ' + e.message;
    }
    
    try {
      tableStatus.productCategories = await ProductCategory.count();
    } catch (e) {
      tableStatus.productCategories = 'Table not found: ' + e.message;
    }
    
    try {
      tableStatus.products = await RecipeProduct.count();
    } catch (e) {
      tableStatus.products = 'Table not found: ' + e.message;
    }
    
    try {
      tableStatus.recipes = await Recipe.count();
    } catch (e) {
      tableStatus.recipes = 'Table not found: ' + e.message;
    }
    
    try {
      tableStatus.recipeIngredients = await RecipeIngredient.count();
    } catch (e) {
      tableStatus.recipeIngredients = 'Table not found: ' + e.message;
    }
    
    try {
      tableStatus.currentStock = await CurrentStock.count();
    } catch (e) {
      tableStatus.currentStock = 'Table not found: ' + e.message;
    }
    
    res.json({
      success: true,
      message: 'Database connection successful',
      tableStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Sync database tables
router.post('/sync-db', async (req, res) => {
  try {
    await sequelize.sync({ force: false, alter: true });
    res.json({
      success: true,
      message: 'Database tables synchronized successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database sync failed',
      error: error.message
    });
  }
});

module.exports = router;