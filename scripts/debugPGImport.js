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

async function debugPGImport() {
  const pgFile = path.join(DATA_DIR, 'PG-Tabel PG.csv');
  console.log(`Checking PG file: ${pgFile}`);
  
  // Check if file exists
  if (!fs.existsSync(pgFile)) {
    console.error('PG file does not exist!');
    return;
  }
  
  console.log('File exists. Reading content...');
  
  try {
    const data = await parseCSV(pgFile);
    console.log(`Found ${data.length} rows`);
    
    if (data.length > 0) {
      console.log('Headers:', Object.keys(data[0]));
      console.log('First 5 rows:');
      data.slice(0, 5).forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row);
      });
    }
    
  } catch (error) {
    console.error('Error reading CSV:', error);
  }
}

debugPGImport();