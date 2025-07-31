const fs = require('fs');
const csv = require('csv-parser');

// Function to parse CSV with semicolon delimiter
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    console.log(`Reading file: ${filePath}`);
    
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => {
        results.push(data);
        if (results.length <= 5) {
          console.log('Sample row:', data);
        }
      })
      .on('end', () => {
        console.log(`Total rows read: ${results.length}`);
        resolve(results);
      })
      .on('error', reject);
  });
}

async function debugCSVFiles() {
  console.log('=== Debug CSV Files ===\n');
  
  const files = [
    '/Users/dedepermana/Downloads/PancongKeceApp-Deploy/Data produk-resep-penjualan/Menu List-Menu.csv',
    '/Users/dedepermana/Downloads/PancongKeceApp-Deploy/Data produk-resep-penjualan/Resep Makanan-Resep Makanan.csv',
    '/Users/dedepermana/Downloads/PancongKeceApp-Deploy/Data produk-resep-penjualan/Resep Kopi-Resep Coffee.csv'
  ];
  
  for (const file of files) {
    try {
      console.log(`\n--- ${file.split('/').pop()} ---`);
      const data = await parseCSV(file);
      
      if (data.length > 0) {
        console.log('Headers:', Object.keys(data[0]));
        console.log('First few rows:');
        data.slice(0, 3).forEach((row, index) => {
          console.log(`Row ${index + 1}:`, row);
        });
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }
}

debugCSVFiles();