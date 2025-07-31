const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Function to extract and structure data from Excel
function extractExcelData(filePath) {
  try {
    console.log('📊 EKSTRAKSI DATA EXCEL UNTUK RECIPE MANAGEMENT SYSTEM');
    console.log('=' .repeat(80));
    
    const workbook = XLSX.readFile(filePath);
    const extractedData = {};
    
    // Extract Master Barang (Raw Materials)
    if (workbook.SheetNames.includes('MB')) {
      extractedData.rawMaterials = extractMasterBarang(workbook.Sheets['MB']);
      console.log(`✅ Master Barang: ${extractedData.rawMaterials.length} items`);
    }
    
    // Extract Purchase Data
    if (workbook.SheetNames.includes('Pembelian')) {
      extractedData.purchases = extractPurchaseData(workbook.Sheets['Pembelian']);
      console.log(`✅ Purchase Data: ${extractedData.purchases.length} records`);
    }
    
    // Extract COGS Data (Recipes)
    const cogsSheets = ['COGS-PG', 'COGS-LM', 'COGS-MC', 'COGS-CO', 'COGS-NC'];
    extractedData.recipes = {};
    
    cogsSheets.forEach(sheetName => {
      if (workbook.SheetNames.includes(sheetName)) {
        extractedData.recipes[sheetName] = extractCOGSData(workbook.Sheets[sheetName], sheetName);
        console.log(`✅ ${sheetName}: ${extractedData.recipes[sheetName].length} recipes`);
      }
    });
    
    // Extract HPP (Final Product Pricing)
    if (workbook.SheetNames.includes('HPP ALL')) {
      extractedData.productPricing = extractHPPData(workbook.Sheets['HPP ALL']);
      console.log(`✅ Product Pricing: ${extractedData.productPricing.length} products`);
    }
    
    // Extract Stock Data
    if (workbook.SheetNames.includes('All Stock')) {
      extractedData.currentStock = extractStockData(workbook.Sheets['All Stock']);
      console.log(`✅ Current Stock: ${extractedData.currentStock.length} items`);
    }
    
    // Save extracted data to JSON files
    saveExtractedData(extractedData);
    
    // Generate database schema
    generateDatabaseSchema(extractedData);
    
    return extractedData;
    
  } catch (error) {
    console.error('❌ Error extracting Excel data:', error.message);
    return null;
  }
}

// Extract Master Barang (Raw Materials)
function extractMasterBarang(worksheet) {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const materials = [];
  
  // Find header row and data rows
  let headerRowIndex = -1;
  for (let i = 0; i < jsonData.length; i++) {
    if (jsonData[i].some(cell => 
      typeof cell === 'string' && 
      (cell.toLowerCase().includes('kode') || cell.toLowerCase().includes('nama') || cell.toLowerCase().includes('barang'))
    )) {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1) return materials;
  
  const headers = jsonData[headerRowIndex];
  
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row.length > 0 && row[0]) {
      const material = {
        code: row[0] || '',
        name: row[1] || '',
        category: row[2] || '',
        unit: row[3] || '',
        price: parseFloat(row[4]) || 0,
        supplier: row[5] || '',
        description: row[6] || ''
      };
      
      if (material.code && material.name) {
        materials.push(material);
      }
    }
  }
  
  return materials;
}

// Extract Purchase Data
function extractPurchaseData(worksheet) {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const purchases = [];
  
  // Find header row
  let headerRowIndex = -1;
  for (let i = 0; i < jsonData.length; i++) {
    if (jsonData[i].some(cell => 
      typeof cell === 'string' && 
      (cell.toLowerCase().includes('tanggal') || cell.toLowerCase().includes('date'))
    )) {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1) return purchases;
  
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row.length > 0 && row[0]) {
      const purchase = {
        date: row[0] || '',
        materialCode: row[1] || '',
        materialName: row[2] || '',
        quantity: parseFloat(row[3]) || 0,
        unit: row[4] || '',
        unitPrice: parseFloat(row[5]) || 0,
        totalPrice: parseFloat(row[6]) || 0,
        supplier: row[7] || '',
        notes: row[8] || ''
      };
      
      if (purchase.materialCode && purchase.quantity > 0) {
        purchases.push(purchase);
      }
    }
  }
  
  return purchases;
}

// Extract COGS Data (Recipes)
function extractCOGSData(worksheet, sheetType) {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const recipes = [];
  
  let currentRecipe = null;
  let headerFound = false;
  
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    // Skip empty rows
    if (!row || row.length === 0 || !row.some(cell => cell)) continue;
    
    // Check if this is a recipe header (product name)
    if (row[0] && typeof row[0] === 'string' && !headerFound) {
      if (currentRecipe && currentRecipe.ingredients.length > 0) {
        recipes.push(currentRecipe);
      }
      
      currentRecipe = {
        type: sheetType,
        productCode: row[0],
        productName: row[1] || row[0],
        category: getCategoryFromType(sheetType),
        ingredients: [],
        totalCost: 0,
        notes: ''
      };
      headerFound = true;
      continue;
    }
    
    // Check if this is ingredient data
    if (currentRecipe && row[0] && typeof row[0] === 'string') {
      const ingredient = {
        materialCode: row[0],
        materialName: row[1] || '',
        quantity: parseFloat(row[2]) || 0,
        unit: row[3] || '',
        unitCost: parseFloat(row[4]) || 0,
        totalCost: parseFloat(row[5]) || 0
      };
      
      if (ingredient.materialCode && ingredient.quantity > 0) {
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

// Extract HPP Data (Product Pricing)
function extractHPPData(worksheet) {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const products = [];
  
  // Find header row
  let headerRowIndex = -1;
  for (let i = 0; i < jsonData.length; i++) {
    if (jsonData[i].some(cell => 
      typeof cell === 'string' && 
      (cell.toLowerCase().includes('sku') || cell.toLowerCase().includes('menu'))
    )) {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1) return products;
  
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row.length > 0 && row[1]) { // SKU in column 1
      const product = {
        sku: row[1] || '',
        name: row[2] || '',
        hpp: parseFloat(row[3]) || 0, // Harga Pokok Produksi
        additionalCost: parseFloat(row[4]) || 0,
        totalCost: parseFloat(row[6]) || 0, // DFC (Direct Food Cost)
        sellingPrice: parseFloat(row[7]) || 0, // UPS (Unit Selling Price)
        margin: 0,
        marginPercent: 0
      };
      
      if (product.sku && product.name) {
        product.margin = product.sellingPrice - product.totalCost;
        product.marginPercent = product.totalCost > 0 ? 
          ((product.margin / product.totalCost) * 100) : 0;
        products.push(product);
      }
    }
  }
  
  return products;
}

// Extract Stock Data
function extractStockData(worksheet) {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const stock = [];
  
  // Find header row
  let headerRowIndex = -1;
  for (let i = 0; i < jsonData.length; i++) {
    if (jsonData[i].some(cell => 
      typeof cell === 'string' && 
      (cell.toLowerCase().includes('kode') || cell.toLowerCase().includes('stock'))
    )) {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1) return stock;
  
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row.length > 0 && row[0]) {
      const stockItem = {
        materialCode: row[0] || '',
        materialName: row[1] || '',
        currentStock: parseFloat(row[2]) || 0,
        unit: row[3] || '',
        minimumStock: parseFloat(row[4]) || 0,
        lastUpdated: new Date().toISOString()
      };
      
      if (stockItem.materialCode) {
        stock.push(stockItem);
      }
    }
  }
  
  return stock;
}

// Helper function to get category from COGS type
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

// Save extracted data to JSON files
function saveExtractedData(data) {
  const outputDir = path.join(__dirname, '../data/extracted');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save each data type to separate JSON files
  Object.keys(data).forEach(key => {
    const filePath = path.join(outputDir, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data[key], null, 2));
    console.log(`💾 Saved ${key} to ${filePath}`);
  });
}

// Generate database schema
function generateDatabaseSchema(data) {
  console.log('\n\n🗄️  GENERATING DATABASE SCHEMA');
  console.log('=' .repeat(80));
  
  const schema = `
-- Recipe Management System Database Schema
-- Generated from Excel data analysis

-- Raw Materials Master
CREATE TABLE raw_materials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(20) NOT NULL,
  current_price DECIMAL(10,2) DEFAULT 0,
  supplier VARCHAR(255),
  description TEXT,
  minimum_stock DECIMAL(10,3) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Product Categories
CREATE TABLE product_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type ENUM('PG', 'LM', 'MC', 'CO', 'SC', 'NC') NOT NULL,
  description TEXT
);

-- Products/Menu Items
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_id INT,
  hpp DECIMAL(10,2) DEFAULT 0, -- Harga Pokok Produksi
  additional_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) NOT NULL,
  margin DECIMAL(10,2) DEFAULT 0,
  margin_percent DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES product_categories(id)
);

-- Recipes (BOM - Bill of Materials)
CREATE TABLE recipes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  version VARCHAR(10) DEFAULT '1.0',
  total_cost DECIMAL(10,2) DEFAULT 0,
  yield_quantity DECIMAL(10,3) DEFAULT 1, -- How many portions this recipe makes
  preparation_time INT DEFAULT 0, -- in minutes
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Recipe Ingredients (BOM Details)
CREATE TABLE recipe_ingredients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipe_id INT NOT NULL,
  material_id INT,
  sub_recipe_id INT, -- For nested recipes (e.g., PG in other recipes)
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id),
  FOREIGN KEY (material_id) REFERENCES raw_materials(id),
  FOREIGN KEY (sub_recipe_id) REFERENCES recipes(id)
);

-- Current Stock Levels
CREATE TABLE current_stock (
  id INT PRIMARY KEY AUTO_INCREMENT,
  material_id INT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES raw_materials(id),
  UNIQUE KEY unique_material (material_id)
);

-- Inventory Transactions
CREATE TABLE inventory_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  material_id INT NOT NULL,
  transaction_type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  reference_type ENUM('PURCHASE', 'SALE', 'PRODUCTION', 'ADJUSTMENT', 'WASTE') NOT NULL,
  reference_id INT, -- Links to sales, purchases, etc.
  notes TEXT,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

-- Purchase Orders
CREATE TABLE purchase_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier VARCHAR(255) NOT NULL,
  order_date DATE NOT NULL,
  delivery_date DATE,
  total_amount DECIMAL(12,2) DEFAULT 0,
  status ENUM('PENDING', 'RECEIVED', 'CANCELLED') DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Order Details
CREATE TABLE purchase_order_details (
  id INT PRIMARY KEY AUTO_INCREMENT,
  po_id INT NOT NULL,
  material_id INT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  received_quantity DECIMAL(10,3) DEFAULT 0,
  FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
  FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

-- Sales Transactions
CREATE TABLE sales_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  customer_id INT,
  total_amount DECIMAL(12,2) NOT NULL,
  payment_method ENUM('CASH', 'CARD', 'TRANSFER', 'QRIS') NOT NULL,
  status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'COMPLETED',
  cashier_id INT,
  notes TEXT
);

-- Sales Transaction Details
CREATE TABLE sales_transaction_details (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  cost_of_goods DECIMAL(10,2) DEFAULT 0, -- Calculated from recipe
  profit DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (transaction_id) REFERENCES sales_transactions(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Stock Alerts
CREATE TABLE stock_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  material_id INT NOT NULL,
  alert_type ENUM('LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED') NOT NULL,
  current_quantity DECIMAL(10,3),
  minimum_quantity DECIMAL(10,3),
  alert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

-- Indexes for better performance
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX idx_sales_transactions_date ON sales_transactions(transaction_date);
CREATE INDEX idx_stock_alerts_unresolved ON stock_alerts(is_resolved, alert_date);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_current_stock_material ON current_stock(material_id);
`;
  
  // Save schema to file
  const schemaPath = path.join(__dirname, '../database/schema.sql');
  const schemaDir = path.dirname(schemaPath);
  
  if (!fs.existsSync(schemaDir)) {
    fs.mkdirSync(schemaDir, { recursive: true });
  }
  
  fs.writeFileSync(schemaPath, schema);
  console.log(`💾 Database schema saved to ${schemaPath}`);
}

// Main execution
if (require.main === module) {
  const excelFilePath = path.join(__dirname, '../../Sajati/Rekapitulasi Penjualan Harian.xlsx');
  
  console.log('🚀 MEMULAI EKSTRAKSI DATA EXCEL');
  console.log('File:', excelFilePath);
  console.log('\n');
  
  const extractedData = extractExcelData(excelFilePath);
  
  if (extractedData) {
    console.log('\n\n✅ EKSTRAKSI DATA SELESAI!');
    console.log('\n📋 DATA YANG BERHASIL DIEKSTRAK:');
    Object.keys(extractedData).forEach(key => {
      const count = Array.isArray(extractedData[key]) ? 
        extractedData[key].length : 
        Object.keys(extractedData[key]).reduce((sum, subKey) => 
          sum + (Array.isArray(extractedData[key][subKey]) ? extractedData[key][subKey].length : 0), 0);
      console.log(`   • ${key}: ${count} records`);
    });
  }
}

module.exports = { extractExcelData };