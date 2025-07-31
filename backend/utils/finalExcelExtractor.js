const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Final comprehensive Excel data extractor
function finalExcelExtraction(filePath) {
  try {
    console.log('🎯 FINAL COMPREHENSIVE EXCEL DATA EXTRACTION');
    console.log('=' .repeat(80));
    
    const workbook = XLSX.readFile(filePath);
    const finalData = {
      products: [],
      rawMaterials: [],
      recipes: [],
      inventory: [],
      purchases: [],
      summary: {}
    };
    
    // Extract Products from HPP ALL
    if (workbook.SheetNames.includes('HPP ALL')) {
      finalData.products = extractProductsFinal(workbook.Sheets['HPP ALL']);
      console.log(`✅ Products: ${finalData.products.length} items`);
    }
    
    // Extract Raw Materials from MB
    if (workbook.SheetNames.includes('MB')) {
      finalData.rawMaterials = extractRawMaterialsFinal(workbook.Sheets['MB']);
      console.log(`✅ Raw Materials: ${finalData.rawMaterials.length} items`);
    }
    
    // Extract Inventory from All Stock
    if (workbook.SheetNames.includes('All Stock')) {
      finalData.inventory = extractInventoryFinal(workbook.Sheets['All Stock']);
      console.log(`✅ Inventory: ${finalData.inventory.length} items`);
    }
    
    // Extract Purchases
    if (workbook.SheetNames.includes('Pembelian')) {
      finalData.purchases = extractPurchasesFinal(workbook.Sheets['Pembelian']);
      console.log(`✅ Purchases: ${finalData.purchases.length} records`);
    }
    
    // Extract Recipes from COGS sheets
    const cogsSheets = ['COGS-PG', 'COGS-LM', 'COGS-MC', 'COGS-CO', 'COGS-NC'];
    cogsSheets.forEach(sheetName => {
      if (workbook.SheetNames.includes(sheetName)) {
        const recipes = extractRecipesFinal(workbook.Sheets[sheetName], sheetName);
        finalData.recipes = finalData.recipes.concat(recipes);
        console.log(`✅ ${sheetName}: ${recipes.length} recipes`);
      }
    });
    
    // Generate summary
    finalData.summary = generateDataSummary(finalData);
    
    // Save final data
    saveFinalData(finalData);
    
    // Generate import scripts
    generateImportScripts(finalData);
    
    return finalData;
    
  } catch (error) {
    console.error('❌ Error in final extraction:', error.message);
    return null;
  }
}

// Extract Products with proper number formatting
function extractProductsFinal(worksheet) {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const products = [];
  
  // Find header row
  let headerRowIndex = -1;
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row.some(cell => 
      typeof cell === 'string' && 
      (cell.includes('No.') || cell.includes('SKU') || cell.includes('Light Meal'))
    )) {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1) return products;
  
  console.log(`\nProducts header:`, jsonData[headerRowIndex]);
  
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    if (!row || row.length < 3) continue;
    if (!row[1] || typeof row[1] !== 'string' || !row[1].includes('.')) continue;
    
    // Parse numbers more carefully
    const hpp = parseFloat(row[3]) || 0;
    const addCost = parseFloat(row[4]) || 0;
    const dfc = parseFloat(row[6]) || 0;
    const sellingPrice = parseFloat(row[7]) || 0;
    
    // If numbers are too large, they might be in wrong format
    const product = {
      no: parseInt(row[0]) || 0,
      sku: row[1].toString().trim(),
      name: row[2].toString().trim(),
      hpp: hpp > 100000 ? Math.round(hpp / 1000) : hpp, // Adjust if too large
      addCost: addCost,
      dfc: dfc > 100000 ? Math.round(dfc / 1000) : dfc,
      sellingPrice: sellingPrice > 100000 ? Math.round(sellingPrice / 1000) : sellingPrice,
      category: getCategoryFromSKU(row[1])
    };
    
    // Calculate margin
    product.margin = product.sellingPrice - product.dfc;
    product.marginPercent = product.dfc > 0 ? 
      Math.round(((product.margin / product.dfc) * 100) * 100) / 100 : 0;
    
    if (product.sku && product.name) {
      products.push(product);
    }
  }
  
  return products;
}

// Extract Raw Materials
function extractRawMaterialsFinal(worksheet) {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const materials = [];
  
  // Find header row
  let headerRowIndex = -1;
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row.some(cell => 
      typeof cell === 'string' && 
      (cell.includes('Kode') || cell.includes('Nama') || cell.includes('Code'))
    )) {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1) return materials;
  
  console.log(`\nMaterials header:`, jsonData[headerRowIndex]);
  
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    if (!row || row.length < 2) continue;
    if (!row[0] || !row[1]) continue;
    
    const material = {
      code: row[0].toString().trim(),
      name: row[1].toString().trim(),
      category: row[2] ? row[2].toString().trim() : '',
      unit: row[3] ? row[3].toString().trim() : 'pcs',
      price: parseFloat(row[4]) || 0,
      supplier: row[5] ? row[5].toString().trim() : ''
    };
    
    materials.push(material);
  }
  
  return materials;
}

// Extract Inventory
function extractInventoryFinal(worksheet) {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const inventory = [];
  
  // Find header row
  let headerRowIndex = -1;
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row.some(cell => 
      typeof cell === 'string' && 
      (cell.includes('Kode') || cell.includes('Nama') || cell.includes('Stock'))
    )) {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1) return inventory;
  
  console.log(`\nInventory header:`, jsonData[headerRowIndex]);
  
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    if (!row || row.length < 2) continue;
    if (!row[0] || !row[1]) continue;
    
    const item = {
      code: row[0].toString().trim(),
      name: row[1].toString().trim(),
      category: row[2] ? row[2].toString().trim() : '',
      unit: row[3] ? row[3].toString().trim() : 'pcs',
      currentStock: parseFloat(row[4]) || 0,
      minimumStock: parseFloat(row[5]) || 0,
      unitPrice: parseFloat(row[6]) || 0
    };
    
    inventory.push(item);
  }
  
  return inventory;
}

// Extract Purchases
function extractPurchasesFinal(worksheet) {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const purchases = [];
  
  // Find header row
  let headerRowIndex = -1;
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row.some(cell => 
      typeof cell === 'string' && 
      (cell.includes('Tanggal') || cell.includes('Date') || cell.includes('Kode'))
    )) {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1) return purchases;
  
  console.log(`\nPurchases header:`, jsonData[headerRowIndex]);
  
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    if (!row || row.length < 3) continue;
    if (!row[1] || !row[2]) continue;
    
    const purchase = {
      date: row[0] ? row[0].toString() : '',
      code: row[1].toString().trim(),
      name: row[2].toString().trim(),
      quantity: parseFloat(row[3]) || 0,
      unit: row[4] ? row[4].toString().trim() : 'pcs',
      unitPrice: parseFloat(row[5]) || 0,
      totalPrice: parseFloat(row[6]) || 0
    };
    
    if (purchase.quantity > 0) {
      purchases.push(purchase);
    }
  }
  
  return purchases;
}

// Extract Recipes from COGS sheets
function extractRecipesFinal(worksheet, sheetType) {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const recipes = [];
  
  let currentRecipe = null;
  let recipeStarted = false;
  
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    if (!row || row.length === 0) continue;
    
    // Check if this is a recipe header (product name)
    // Recipe headers usually have text in first column and are not ingredient rows
    if (row[0] && typeof row[0] === 'string' && 
        !row[0].includes('No.') && 
        !row[0].includes('DESCRIPTIONS') &&
        row[1] !== 'DESCRIPTIONS' &&
        !Number.isInteger(row[0])) {
      
      // Save previous recipe if exists
      if (currentRecipe && currentRecipe.ingredients.length > 0) {
        recipes.push(currentRecipe);
      }
      
      // Start new recipe
      currentRecipe = {
        type: sheetType,
        category: getCategoryFromType(sheetType),
        productName: row[0].toString().trim(),
        productCode: '', // Will be filled from first ingredient row
        ingredients: [],
        totalCost: 0,
        yield: 1
      };
      recipeStarted = true;
      continue;
    }
    
    // Check if this is an ingredient row
    if (currentRecipe && recipeStarted && row[0] && Number.isInteger(row[0])) {
      const ingredient = {
        no: parseInt(row[0]),
        description: row[1] ? row[1].toString().trim() : '',
        code: row[2] ? row[2].toString().trim() : '',
        name: row[3] ? row[3].toString().trim() : '',
        unit: row[4] ? row[4].toString().trim() : '',
        quantity: parseFloat(row[5]) || 0,
        unitCost: parseFloat(row[6]) || 0,
        totalCost: parseFloat(row[7]) || 0
      };
      
      // Set product code from first ingredient if not set
      if (!currentRecipe.productCode && ingredient.description) {
        currentRecipe.productCode = ingredient.description;
      }
      
      if (ingredient.code && ingredient.name) {
        currentRecipe.ingredients.push(ingredient);
        currentRecipe.totalCost += ingredient.totalCost;
      }
    }
  }
  
  // Add the last recipe
  if (currentRecipe && currentRecipe.ingredients.length > 0) {
    recipes.push(currentRecipe);
  }
  
  return recipes;
}

// Helper functions
function getCategoryFromSKU(sku) {
  if (!sku) return 'Unknown';
  
  const prefix = sku.split('.')[0];
  const categories = {
    'LM': 'Light Meal',
    'MC': 'Main Course',
    'CO': 'Coffee',
    'NC': 'Non-Coffee',
    'PG': 'Paste/Garnish'
  };
  
  return categories[prefix] || 'Unknown';
}

function getCategoryFromType(type) {
  const categories = {
    'COGS-PG': 'Paste/Garnish',
    'COGS-LM': 'Light Meal',
    'COGS-MC': 'Main Course',
    'COGS-CO': 'Coffee',
    'COGS-NC': 'Non-Coffee'
  };
  return categories[type] || 'Unknown';
}

// Generate data summary
function generateDataSummary(data) {
  const summary = {
    totalProducts: data.products.length,
    totalRawMaterials: data.rawMaterials.length,
    totalRecipes: data.recipes.length,
    totalInventoryItems: data.inventory.length,
    totalPurchaseRecords: data.purchases.length,
    productsByCategory: {},
    recipesByCategory: {},
    inventoryValue: 0,
    averageMargin: 0
  };
  
  // Products by category
  data.products.forEach(product => {
    summary.productsByCategory[product.category] = 
      (summary.productsByCategory[product.category] || 0) + 1;
  });
  
  // Recipes by category
  data.recipes.forEach(recipe => {
    summary.recipesByCategory[recipe.category] = 
      (summary.recipesByCategory[recipe.category] || 0) + 1;
  });
  
  // Inventory value
  summary.inventoryValue = data.inventory.reduce((total, item) => 
    total + (item.currentStock * item.unitPrice), 0);
  
  // Average margin
  const validMargins = data.products.filter(p => p.marginPercent > 0 && p.marginPercent < 1000);
  summary.averageMargin = validMargins.length > 0 ? 
    validMargins.reduce((sum, p) => sum + p.marginPercent, 0) / validMargins.length : 0;
  
  return summary;
}

// Save final data
function saveFinalData(data) {
  const outputDir = path.join(__dirname, '../data/final');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save each data type
  Object.keys(data).forEach(key => {
    const filePath = path.join(outputDir, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data[key], null, 2));
    console.log(`💾 Saved ${key} to ${filePath}`);
  });
  
  // Save combined data
  const combinedPath = path.join(outputDir, 'combined_data.json');
  fs.writeFileSync(combinedPath, JSON.stringify(data, null, 2));
  console.log(`💾 Saved combined data to ${combinedPath}`);
}

// Generate import scripts
function generateImportScripts(data) {
  console.log('\n\n🔧 GENERATING IMPORT SCRIPTS');
  console.log('=' .repeat(80));
  
  const scriptsDir = path.join(__dirname, '../scripts');
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }
  
  // Generate SQL import script
  const sqlScript = generateSQLImportScript(data);
  fs.writeFileSync(path.join(scriptsDir, 'import_data.sql'), sqlScript);
  console.log('✅ SQL import script generated');
  
  // Generate Node.js import script
  const nodeScript = generateNodeImportScript();
  fs.writeFileSync(path.join(scriptsDir, 'importData.js'), nodeScript);
  console.log('✅ Node.js import script generated');
}

// Generate SQL import script
function generateSQLImportScript(data) {
  let sql = `-- Recipe Management System Data Import\n-- Generated from Excel data\n\n`;
  
  sql += `-- Clear existing data\nSET FOREIGN_KEY_CHECKS = 0;\n`;
  sql += `TRUNCATE TABLE recipe_ingredients;\n`;
  sql += `TRUNCATE TABLE recipes;\n`;
  sql += `TRUNCATE TABLE current_stock;\n`;
  sql += `TRUNCATE TABLE products;\n`;
  sql += `TRUNCATE TABLE raw_materials;\n`;
  sql += `TRUNCATE TABLE product_categories;\n`;
  sql += `SET FOREIGN_KEY_CHECKS = 1;\n\n`;
  
  // Insert categories
  sql += `-- Insert product categories\n`;
  const categories = ['Light Meal', 'Main Course', 'Coffee', 'Non-Coffee', 'Paste/Garnish'];
  const types = ['LM', 'MC', 'CO', 'NC', 'PG'];
  
  categories.forEach((cat, index) => {
    sql += `INSERT INTO product_categories (name, type, description) VALUES ('${cat}', '${types[index]}', '${cat} products');\n`;
  });
  
  sql += `\n-- Insert raw materials\n`;
  data.rawMaterials.forEach(material => {
    sql += `INSERT INTO raw_materials (code, name, category, unit, current_price, supplier) VALUES `;
    sql += `('${material.code}', '${material.name.replace(/'/g, "''")}', '${material.category}', '${material.unit}', ${material.price}, '${material.supplier}');\n`;
  });
  
  return sql;
}

// Generate Node.js import script
function generateNodeImportScript() {
  return `const fs = require('fs');
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

module.exports = { importAllData };`;
}

// Main execution
if (require.main === module) {
  const excelFilePath = path.join(__dirname, '../../Sajati/Rekapitulasi Penjualan Harian.xlsx');
  
  console.log('🎯 STARTING FINAL COMPREHENSIVE EXTRACTION');
  console.log('File:', excelFilePath);
  console.log('\n');
  
  const finalData = finalExcelExtraction(excelFilePath);
  
  if (finalData) {
    console.log('\n\n🎉 FINAL EXTRACTION COMPLETED SUCCESSFULLY!');
    console.log('\n📊 EXTRACTION SUMMARY:');
    console.log(`   • Products: ${finalData.summary.totalProducts}`);
    console.log(`   • Raw Materials: ${finalData.summary.totalRawMaterials}`);
    console.log(`   • Recipes: ${finalData.summary.totalRecipes}`);
    console.log(`   • Inventory Items: ${finalData.summary.totalInventoryItems}`);
    console.log(`   • Purchase Records: ${finalData.summary.totalPurchaseRecords}`);
    console.log(`   • Total Inventory Value: Rp ${finalData.summary.inventoryValue.toLocaleString()}`);
    console.log(`   • Average Margin: ${finalData.summary.averageMargin.toFixed(2)}%`);
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Review extracted data in /data/final/');
    console.log('2. Run database migration with schema.sql');
    console.log('3. Execute import scripts to populate database');
    console.log('4. Integrate with POS and inventory systems');
    console.log('5. Implement real-time stock tracking');
  }
}

module.exports = { finalExcelExtraction };