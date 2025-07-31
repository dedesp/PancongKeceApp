const XLSX = require('xlsx');
const path = require('path');

// Function to analyze Excel structure for Recipe Management System
function analyzeExcelStructure(filePath) {
  try {
    console.log('🔍 ANALISIS STRUKTUR DATA EXCEL UNTUK SISTEM RECIPE MANAGEMENT');
    console.log('=' .repeat(80));
    
    const workbook = XLSX.readFile(filePath);
    const analysis = {};
    
    // Analyze each sheet
    workbook.SheetNames.forEach(sheetName => {
      console.log(`\n📋 SHEET: ${sheetName}`);
      console.log('-'.repeat(50));
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Filter out empty rows
      const filteredData = jsonData.filter(row => row.some(cell => cell !== undefined && cell !== ''));
      
      analysis[sheetName] = {
        totalRows: filteredData.length,
        headers: filteredData[0] || [],
        sampleData: filteredData.slice(1, 6), // First 5 data rows
        structure: analyzeSheetStructure(sheetName, filteredData)
      };
      
      console.log(`Total Rows: ${filteredData.length}`);
      console.log(`Headers:`, filteredData[0] || []);
      console.log(`Sample Data (first 3 rows):`);
      filteredData.slice(1, 4).forEach((row, index) => {
        console.log(`  Row ${index + 1}:`, row.slice(0, 8), '...'); // Show first 8 columns
      });
    });
    
    // Generate system recommendations
    generateSystemRecommendations(analysis);
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Error analyzing Excel:', error.message);
    return null;
  }
}

// Analyze specific sheet structure
function analyzeSheetStructure(sheetName, data) {
  const structure = {
    purpose: '',
    keyFields: [],
    relationships: [],
    systemIntegration: ''
  };
  
  switch (sheetName) {
    case 'MB':
      structure.purpose = 'Master Barang - Daftar semua bahan baku dan produk';
      structure.keyFields = ['Kode Barang', 'Nama Barang', 'Kategori', 'Satuan', 'Harga'];
      structure.systemIntegration = 'Inventory Management, Product Catalog';
      break;
      
    case 'COGS-PG':
      structure.purpose = 'Recipe untuk Racikan Bumbu (Paste/Garnish)';
      structure.keyFields = ['Kode Recipe', 'Bahan Baku', 'Takaran', 'Biaya per Unit'];
      structure.systemIntegration = 'Recipe Management, Cost Calculation';
      break;
      
    case 'COGS-LM':
      structure.purpose = 'Recipe untuk Light Meal';
      structure.keyFields = ['Menu Code', 'Ingredients', 'Quantity', 'Cost'];
      structure.systemIntegration = 'POS Menu, Recipe BOM, Cost Analysis';
      break;
      
    case 'COGS-MC':
      structure.purpose = 'Recipe untuk Main Course';
      structure.keyFields = ['Menu Code', 'Ingredients', 'Quantity', 'Cost'];
      structure.systemIntegration = 'POS Menu, Recipe BOM, Cost Analysis';
      break;
      
    case 'COGS-CO':
      structure.purpose = 'Recipe untuk Coffee-based Products';
      structure.keyFields = ['Menu Code', 'Ingredients', 'Quantity', 'Cost'];
      structure.systemIntegration = 'POS Menu, Recipe BOM, Cost Analysis';
      break;
      
    case 'COGS-NC':
      structure.purpose = 'Recipe untuk Non-Coffee Products';
      structure.keyFields = ['Menu Code', 'Ingredients', 'Quantity', 'Cost'];
      structure.systemIntegration = 'POS Menu, Recipe BOM, Cost Analysis';
      break;
      
    case 'HPP ALL':
      structure.purpose = 'Harga Pokok Penjualan - Final Product Pricing';
      structure.keyFields = ['Product Code', 'Production Cost', 'Selling Price', 'Margin'];
      structure.systemIntegration = 'POS Pricing, Financial Reporting, Profit Analysis';
      break;
      
    case 'Pembelian':
      structure.purpose = 'Data Pembelian Bahan Baku';
      structure.keyFields = ['Tanggal', 'Kode Barang', 'Qty', 'Harga', 'Total'];
      structure.systemIntegration = 'Inventory In, Cost Tracking, Supplier Management';
      break;
      
    case 'Stock In':
      structure.purpose = 'Log Masuk Stok';
      structure.systemIntegration = 'Inventory Management, Stock Tracking';
      break;
      
    case 'Stock Out':
      structure.purpose = 'Log Keluar Stok';
      structure.systemIntegration = 'Production Tracking, Sales Impact on Inventory';
      break;
      
    case 'All Stock':
      structure.purpose = 'Current Stock Levels';
      structure.systemIntegration = 'Real-time Inventory, Stock Alerts';
      break;
  }
  
  return structure;
}

// Generate system recommendations
function generateSystemRecommendations(analysis) {
  console.log('\n\n🎯 REKOMENDASI SISTEM BERDASARKAN ANALISIS DATA');
  console.log('=' .repeat(80));
  
  console.log('\n1. 📊 DATABASE SCHEMA YANG DIBUTUHKAN:');
  console.log('   • recipes (master recipe dengan BOM)');
  console.log('   • recipe_ingredients (detail bahan per recipe)');
  console.log('   • raw_materials (master bahan baku)');
  console.log('   • inventory_transactions (in/out movements)');
  console.log('   • current_stock (real-time stock levels)');
  console.log('   • product_costs (COGS calculation)');
  console.log('   • sales_impact_inventory (tracking penggunaan bahan per penjualan)');
  
  console.log('\n2. 🔄 BUSINESS LOGIC YANG HARUS DIIMPLEMENTASI:');
  console.log('   • Recipe BOM Calculator (hitung total cost per menu)');
  console.log('   • Auto Stock Deduction (kurangi stok otomatis saat penjualan)');
  console.log('   • Real-time Inventory Tracking');
  console.log('   • Cost Analysis per Transaction');
  console.log('   • Stock Alert System (minimum threshold)');
  console.log('   • Profit Margin Calculator');
  
  console.log('\n3. 🎮 FITUR POS YANG DIBUTUHKAN:');
  console.log('   • Menu dengan harga jual (dari HPP ALL)');
  console.log('   • Auto inventory deduction saat transaksi');
  console.log('   • Real-time stock checking sebelum penjualan');
  console.log('   • Cost tracking per item terjual');
  
  console.log('\n4. 📈 REPORTING YANG DIBUTUHKAN:');
  console.log('   • Daily Stock Usage Report');
  console.log('   • Cost vs Revenue Analysis');
  console.log('   • Inventory Turnover Report');
  console.log('   • Profit Margin per Product');
  console.log('   • Stock Reorder Recommendations');
  
  console.log('\n5. ⚠️  CRITICAL FEATURES:');
  console.log('   • Real-time stock synchronization');
  console.log('   • Automatic COGS calculation');
  console.log('   • Multi-level recipe support (PG dalam COGS lain)');
  console.log('   • Batch tracking untuk bahan baku');
  console.log('   • Cost allocation per portion');
}

// Main execution
if (require.main === module) {
  const excelFilePath = path.join(__dirname, '../../Sajati/Rekapitulasi Penjualan Harian.xlsx');
  
  console.log('🚀 MEMULAI ANALISIS SISTEM RECIPE MANAGEMENT');
  console.log('File:', excelFilePath);
  console.log('\n');
  
  const analysis = analyzeExcelStructure(excelFilePath);
  
  if (analysis) {
    console.log('\n\n✅ ANALISIS SELESAI!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Design database schema berdasarkan analisis');
    console.log('2. Create data import scripts');
    console.log('3. Implement recipe BOM system');
    console.log('4. Build real-time inventory tracking');
    console.log('5. Integrate dengan POS system');
  }
}

module.exports = { analyzeExcelStructure };