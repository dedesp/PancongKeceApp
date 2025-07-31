const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Manual analysis of Excel structure
function manualExcelAnalysis(filePath) {
  try {
    console.log('🔍 MANUAL ANALYSIS OF EXCEL STRUCTURE');
    console.log('=' .repeat(80));
    
    const workbook = XLSX.readFile(filePath);
    
    // Analyze each sheet in detail
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`\n📋 SHEET ${index + 1}: ${sheetName}`);
      console.log('-'.repeat(50));
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Show first 15 rows to understand structure
      console.log('First 15 rows:');
      jsonData.slice(0, 15).forEach((row, rowIndex) => {
        if (row.length > 0) {
          console.log(`Row ${rowIndex + 1}:`, row.slice(0, 10)); // Show first 10 columns
        }
      });
      
      // Find potential header rows
      console.log('\nPotential header rows:');
      jsonData.forEach((row, rowIndex) => {
        if (row.some(cell => 
          typeof cell === 'string' && 
          (cell.toLowerCase().includes('kode') || 
           cell.toLowerCase().includes('nama') || 
           cell.toLowerCase().includes('sku') ||
           cell.toLowerCase().includes('menu') ||
           cell.toLowerCase().includes('barang') ||
           cell.toLowerCase().includes('harga') ||
           cell.toLowerCase().includes('qty') ||
           cell.toLowerCase().includes('stock'))
        )) {
          console.log(`  Row ${rowIndex + 1}:`, row.slice(0, 8));
        }
      });
      
      console.log(`\nTotal rows: ${jsonData.length}`);
      console.log(`Max columns: ${Math.max(...jsonData.map(row => row.length))}`);
    });
    
  } catch (error) {
    console.error('❌ Error in manual analysis:', error.message);
  }
}

// Improved data extraction based on manual analysis
function improvedDataExtraction(filePath) {
  try {
    console.log('\n\n🚀 IMPROVED DATA EXTRACTION');
    console.log('=' .repeat(80));
    
    const workbook = XLSX.readFile(filePath);
    const extractedData = {};
    
    // Extract HPP ALL (Product Pricing) - This seems to be working
    if (workbook.SheetNames.includes('HPP ALL')) {
      extractedData.products = extractHPPImproved(workbook.Sheets['HPP ALL']);
      console.log(`✅ Products extracted: ${extractedData.products.length}`);
    }
    
    // Extract All Stock - Need to fix the column mapping
    if (workbook.SheetNames.includes('All Stock')) {
      extractedData.inventory = extractStockImproved(workbook.Sheets['All Stock']);
      console.log(`✅ Inventory items extracted: ${extractedData.inventory.length}`);
    }
    
    // Extract Master Barang (MB)
    if (workbook.SheetNames.includes('MB')) {
      extractedData.materials = extractMBImproved(workbook.Sheets['MB']);
      console.log(`✅ Raw materials extracted: ${extractedData.materials.length}`);
    }
    
    // Extract Purchase data
    if (workbook.SheetNames.includes('Pembelian')) {
      extractedData.purchases = extractPurchaseImproved(workbook.Sheets['Pembelian']);
      console.log(`✅ Purchase records extracted: ${extractedData.purchases.length}`);
    }
    
    // Extract COGS data (Recipes)
    const cogsSheets = ['COGS-PG', 'COGS-LM', 'COGS-MC', 'COGS-CO', 'COGS-NC'];
    extractedData.recipes = {};
    
    cogsSheets.forEach(sheetName => {
      if (workbook.SheetNames.includes(sheetName)) {
        extractedData.recipes[sheetName] = extractCOGSImproved(workbook.Sheets[sheetName], sheetName);
        console.log(`✅ ${sheetName} recipes extracted: ${extractedData.recipes[sheetName].length}`);
      }
    });
    
    // Save improved extracted data
    saveImprovedData(extractedData);
    
    return extractedData;
    
  } catch (error) {
    console.error('❌ Error in improved extraction:', error.message);
    return null;
  }
}

// Improved HPP extraction
function extractHPPImproved(worksheet) {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const products = [];
  
  // Find the actual header row by looking for "SKU" or "Light Meal"
  let headerRowIndex = -1;
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row.some(cell => 
      typeof cell === 'string' && 
      (cell.includes('SKU') || cell.includes('Light Meal') || cell.includes('No.'))
    )) {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1) return products;
  
  console.log(`\nHPP Header found at row ${headerRowIndex + 1}:`, jsonData[headerRowIndex]);
  
  // Extract data starting from header + 1
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    // Skip empty rows
    if (!row || row.length < 3) continue;
    
    // Skip rows that don't have SKU (assuming SKU is in column 1)
    if (!row[1] || typeof row[1] !== 'string' || !row[1].includes('.')) continue;
    
    const product = {
      no: row[0] || '',
      sku: row[1] || '',
      name: row[2] || '',
      hpp: parseFloat(row[3]) || 0,
      addCost: parseFloat(row[4]) || 0,
      dfc: parseFloat(row[6]) || 0, // Direct Food Cost
      sellingPrice: parseFloat(row[7]) || 0, // UPS
      category: getCategoryFromSKU(row[1])
    };
    
    if (product.sku && product.name) {
      product.margin = product.sellingPrice - product.dfc;
      product.marginPercent = product.dfc > 0 ? 
        ((product.margin / product.dfc) * 100) : 0;
      products.push(product);
    }
  }
  
  return products;
}

// Improved Stock extraction
function extractStockImproved(worksheet) {
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
  
  console.log(`\nStock Header found at row ${headerRowIndex + 1}:`, jsonData[headerRowIndex]);
  
  // Extract data
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    if (!row || row.length < 2) continue;
    
    const item = {
      code: row[0] || '',
      name: row[1] || '',
      category: row[2] || '',
      unit: row[3] || '',
      currentStock: parseFloat(row[4]) || 0,
      minimumStock: parseFloat(row[5]) || 0,
      price: parseFloat(row[6]) || 0
    };
    
    if (item.code && item.name) {
      inventory.push(item);
    }
  }
  
  return inventory;
}

// Improved MB (Master Barang) extraction
function extractMBImproved(worksheet) {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const materials = [];
  
  // Find header row
  let headerRowIndex = -1;
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row.some(cell => 
      typeof cell === 'string' && 
      (cell.includes('Kode') || cell.includes('Nama') || cell.includes('Barang'))
    )) {
      headerRowIndex = i;
      break;
    }
  }
  
  if (headerRowIndex === -1) return materials;
  
  console.log(`\nMB Header found at row ${headerRowIndex + 1}:`, jsonData[headerRowIndex]);
  
  // Extract data
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    if (!row || row.length < 2) continue;
    
    const material = {
      code: row[0] || '',
      name: row[1] || '',
      category: row[2] || '',
      unit: row[3] || '',
      price: parseFloat(row[4]) || 0,
      supplier: row[5] || ''
    };
    
    if (material.code && material.name) {
      materials.push(material);
    }
  }
  
  return materials;
}

// Improved Purchase extraction
function extractPurchaseImproved(worksheet) {
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
  
  console.log(`\nPurchase Header found at row ${headerRowIndex + 1}:`, jsonData[headerRowIndex]);
  
  // Extract data
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    if (!row || row.length < 3) continue;
    
    const purchase = {
      date: row[0] || '',
      code: row[1] || '',
      name: row[2] || '',
      quantity: parseFloat(row[3]) || 0,
      unit: row[4] || '',
      unitPrice: parseFloat(row[5]) || 0,
      totalPrice: parseFloat(row[6]) || 0
    };
    
    if (purchase.code && purchase.quantity > 0) {
      purchases.push(purchase);
    }
  }
  
  return purchases;
}

// Improved COGS extraction
function extractCOGSImproved(worksheet, sheetType) {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const recipes = [];
  
  console.log(`\nAnalyzing ${sheetType} structure...`);
  
  // Show first few rows to understand structure
  jsonData.slice(0, 10).forEach((row, index) => {
    if (row.length > 0) {
      console.log(`  Row ${index + 1}:`, row.slice(0, 6));
    }
  });
  
  // For now, return empty array - need to understand structure better
  return recipes;
}

// Helper function to get category from SKU
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

// Save improved data
function saveImprovedData(data) {
  const outputDir = path.join(__dirname, '../data/improved');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  Object.keys(data).forEach(key => {
    const filePath = path.join(outputDir, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data[key], null, 2));
    console.log(`💾 Saved improved ${key} to ${filePath}`);
  });
}

// Main execution
if (require.main === module) {
  const excelFilePath = path.join(__dirname, '../../Sajati/Rekapitulasi Penjualan Harian.xlsx');
  
  console.log('🔍 STARTING MANUAL EXCEL ANALYSIS');
  console.log('File:', excelFilePath);
  
  // First do manual analysis
  manualExcelAnalysis(excelFilePath);
  
  // Then do improved extraction
  const extractedData = improvedDataExtraction(excelFilePath);
  
  if (extractedData) {
    console.log('\n\n✅ IMPROVED EXTRACTION COMPLETED!');
  }
}

module.exports = { manualExcelAnalysis, improvedDataExtraction };