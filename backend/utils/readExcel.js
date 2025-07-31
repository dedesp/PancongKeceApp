const XLSX = require('xlsx');
const path = require('path');

// Function to read Excel file
function readExcelFile(filePath) {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    
    // Get all sheet names
    const sheetNames = workbook.SheetNames;
    console.log('📊 Sheet names:', sheetNames);
    
    const result = {};
    
    // Process each sheet
    sheetNames.forEach(sheetName => {
      console.log(`\n📋 Processing sheet: ${sheetName}`);
      
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Store in result
      result[sheetName] = jsonData;
      
      // Display first few rows
      console.log('First 10 rows:');
      jsonData.slice(0, 10).forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row);
      });
      
      console.log(`Total rows: ${jsonData.length}`);
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Error reading Excel file:', error.message);
    return null;
  }
}

// Main execution
if (require.main === module) {
  const excelFilePath = path.join(__dirname, '../../Sajati/Rekapitulasi Penjualan Harian.xlsx');
  
  console.log('🔍 Reading Excel file:', excelFilePath);
  console.log('=' .repeat(50));
  
  const data = readExcelFile(excelFilePath);
  
  if (data) {
    console.log('\n✅ Excel file read successfully!');
    console.log('\n📊 Summary:');
    Object.keys(data).forEach(sheetName => {
      console.log(`- Sheet "${sheetName}": ${data[sheetName].length} rows`);
    });
  }
}

module.exports = { readExcelFile };