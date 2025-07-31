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

async function debugRecipeImport() {
  const recipeFiles = [
    'Resep Makanan-Resep Makanan.csv',
    'Resep Kopi-Resep Coffee.csv',
    'Resep Non Kopi-Resep Non Coffee.csv'
  ];
  
  for (const fileName of recipeFiles) {
    const filePath = path.join(DATA_DIR, fileName);
    console.log(`\nChecking recipe file: ${fileName}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('Recipe file does not exist!');
      continue;
    }
    
    console.log('File exists. Reading content...');
    
    try {
      const data = await parseCSV(filePath);
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
}

debugRecipeImport();