const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const DATA_DIR = path.join(__dirname, '../Data produk-resep-penjualan');

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function debugMenuImport() {
  const menuFile = path.join(DATA_DIR, 'Menu List-Menu.csv');
  console.log(`Checking menu file: ${menuFile}`);
  
  // Check if file exists
  if (!fs.existsSync(menuFile)) {
    console.error('Menu file does not exist!');
    return;
  }
  
  console.log('File exists. Reading content...');
  
  try {
    const data = await parseCSV(menuFile);
    console.log(`Found ${data.length} rows`);
    
    if (data.length > 0) {
      console.log('Headers:', Object.keys(data[0]));
      console.log('First 3 rows:');
      data.slice(0, 3).forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row);
      });
    }
    
    // Check for valid products
    let validProducts = 0;
    for (const item of data) {
      if (item.SKU && item.Kategori && item['Nama Produk'] && item.SKU !== 'SKU') {
        validProducts++;
      }
    }
    console.log(`Valid products found: ${validProducts}`);
    
  } catch (error) {
    console.error('Error reading CSV:', error);
  }
}

debugMenuImport();