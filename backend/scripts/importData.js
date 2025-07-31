const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models');

// Import all data from JSON files
async function importAllData() {
  try {
    console.log('🚀 Starting data import...');
    
    const dataDir = path.join(__dirname, '../data/final');
    
    // Read all data files
    const products = JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json')));
    const rawMaterials = JSON.parse(fs.readFileSync(path.join(dataDir, 'rawMaterials.json')));
    const recipes = JSON.parse(fs.readFileSync(path.join(dataDir, 'recipes.json')));
    const inventory = JSON.parse(fs.readFileSync(path.join(dataDir, 'inventory.json')));
    
    // Import data in correct order
    await importRawMaterials(rawMaterials);
    await importProducts(products);
    await importRecipes(recipes);
    await importInventory(inventory);
    
    console.log('✅ Data import completed successfully!');
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
  }
}

// Import functions for each data type
async function importRawMaterials(materials) {
  console.log('📦 Importing raw materials...');
  // Implementation here
}

async function importProducts(products) {
  console.log('🍽️  Importing products...');
  // Implementation here
}

async function importRecipes(recipes) {
  console.log('📋 Importing recipes...');
  // Implementation here
}

async function importInventory(inventory) {
  console.log('📊 Importing inventory...');
  // Implementation here
}

if (require.main === module) {
  importAllData();
}

module.exports = { importAllData };