const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { sequelize } = require('../backend/config/database');
const models = require('../backend/models');
const recipeModels = require('../backend/models/RecipeManagement');

// Combine all models
const allModels = { ...models, ...recipeModels };

// Data directory path
const DATA_DIR = path.join(__dirname, '../Data produk-resep-penjualan');

// Function to parse CSV with semicolon delimiter
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

// Import categories and menu data from CSV
async function importMenuData() {
  console.log('Importing menu data...');
  
  const menuFile = path.join(DATA_DIR, 'Menu List-Menu.csv');
  console.log(`Reading menu file: ${menuFile}`);
  
  try {
    const data = await parseCSV(menuFile);
    console.log(`Found ${data.length} rows in menu file`);
    if (data.length > 0) {
      console.log('Sample row:', data[0]);
    }
    
    // First, create all categories
    const categoryMap = new Map();
    const categories = {
      'Light Meal': 'LM',
      'Main Course': 'MC', 
      'Coffee': 'CO',
      'Sweet Coffee': 'SC',
      'Non Coffee': 'NC'
    };
    
    for (const [categoryName, categoryType] of Object.entries(categories)) {
      const [category] = await allModels.ProductCategory.findOrCreate({
        where: { name: categoryName },
        defaults: {
          name: categoryName,
          type: categoryType,
          description: `Kategori ${categoryName}`
        }
      });
      categoryMap.set(categoryName, category);
    }
    
    // Create PG category for semi-finished products
    const [pgCategory] = await allModels.ProductCategory.findOrCreate({
      where: { name: 'Produk Setengah Jadi' },
      defaults: {
        name: 'Produk Setengah Jadi',
        type: 'PG',
        description: 'Formula reusable untuk berbagai produk'
      }
    });
    categoryMap.set('PG', pgCategory);
    
    // Import menu products
    let productCount = 0;
    for (const item of data) {
      // Map CSV columns: Menu = SKU, _1 = Kategori, _2 = Nama Produk
      const sku = item.Menu;
      const kategori = item._1;
      const namaProduk = item._2;
      
      if (!sku || !kategori || !namaProduk || sku === 'SKU') {
        console.log(`Skipping row:`, item);
        continue;
      }
      
      const category = categoryMap.get(kategori);
      if (!category) {
        console.warn(`Category not found: ${kategori}`);
        continue;
      }
      
      const [product, created] = await allModels.RecipeProduct.findOrCreate({
        where: { sku: sku },
        defaults: {
          sku: sku,
          name: namaProduk,
          categoryId: category.id,
          sellingPrice: 25000, // Default price, will be updated later
          isActive: true
        }
      });
      
      if (created) {
        productCount++;
        console.log(`Created product: ${namaProduk} (${sku})`);
      }
    }
    
    console.log(`Menu data imported successfully. Created ${productCount} products.`);
  } catch (error) {
    console.error('Error importing menu data:', error);
  }
}

// Import PG (Produk Setengah Jadi) data
async function importPGData() {
  console.log('Importing PG (Produk Setengah Jadi) data...');
  
  const pgFile = path.join(DATA_DIR, 'PG-Tabel PG.csv');
  
  try {
    const data = await parseCSV(pgFile);
    const pgCategory = await allModels.ProductCategory.findOne({ where: { type: 'PG' } });
    
    let currentPGName = null;
    let currentPGProduct = null;
    let currentPGRecipe = null;
    let pgCount = 1;
    
    for (const row of data) {
      // Map CSV columns: 'Tabel PG' = Nama PG, _1 = Bahan, _2 = Qty Produksi, _3 = Volume
      const namaPG = row['Tabel PG'];
      const bahan = row._1;
      const qtyProduksi = row._2;
      const volume = row._3;
      
      // Check if this is a PG header (Nama PG column has value)
      if (namaPG && namaPG.trim() !== '' && namaPG !== 'Nama PG') {
        currentPGName = namaPG.trim();
        
        // Create PG product
        const [pgProduct] = await allModels.RecipeProduct.findOrCreate({
          where: { name: currentPGName },
          defaults: {
            sku: `PG.${String(pgCount).padStart(4, '0')}`,
            name: currentPGName,
            categoryId: pgCategory.id,
            sellingPrice: 0, // PG doesn't have selling price
            isActive: true
          }
        });
        currentPGProduct = pgProduct;
        pgCount++;
        console.log(`Created PG product: ${currentPGName}`);
        
        // Create recipe for this PG
        const [pgRecipe] = await allModels.Recipe.findOrCreate({
          where: { productId: currentPGProduct.id },
          defaults: {
            productId: currentPGProduct.id,
            version: '1.0',
            yieldQuantity: 1, // Default yield
            notes: `Formula PG untuk ${currentPGName}`,
            isActive: true
          }
        });
        currentPGRecipe = pgRecipe;
      }
      
      // Process ingredients for current PG
      if (currentPGRecipe && bahan && bahan.trim() !== '' && bahan !== 'Bahan') {
        const ingredientName = bahan.trim();
        const quantity = parseFloat(qtyProduksi?.replace(',', '.')) || 0;
        const unit = volume || 'Gram';
        
        if (ingredientName && quantity > 0) {
          // Create or find raw material
          const [ingredient] = await allModels.RawMaterial.findOrCreate({
            where: { name: ingredientName },
            defaults: {
              code: `RM-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: ingredientName,
              category: 'Bahan Baku',
              unit: unit,
              currentPrice: 0,
              minimumStock: 10
            }
          });
          
          // Add ingredient to PG recipe
          await allModels.RecipeIngredient.findOrCreate({
            where: {
              recipeId: currentPGRecipe.id,
              materialId: ingredient.id
            },
            defaults: {
              recipeId: currentPGRecipe.id,
              materialId: ingredient.id,
              quantity: quantity,
              unit: unit
            }
          });
        }
      }
    }
    
    console.log('PG data imported successfully');
  } catch (error) {
    console.error('Error importing PG data:', error);
  }
}

// Function to import ingredients from recipe files
async function importIngredients() {
  console.log('Importing additional ingredients...');
  
  const recipeFiles = [
    path.join(DATA_DIR, 'Resep Makanan-Resep Makanan.csv'),
    path.join(DATA_DIR, 'Resep Kopi-Resep Coffee.csv'),
    path.join(DATA_DIR, 'Resep Non Kopi-Resep Non Coffee.csv')
  ];
  
  const ingredients = new Set();
  
  for (const file of recipeFiles) {
    try {
      const data = await parseCSV(file);
      
      for (const row of data) {
        if (row._1) {
          const ingredientName = row._1;
          if (ingredientName && ingredientName.trim() !== '' && ingredientName !== 'Resep' && ingredientName !== 'Bahan') {
            ingredients.add(ingredientName.trim());
          }
        }
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }
  
  // Create ingredients in database
  for (const ingredientName of ingredients) {
    await allModels.RawMaterial.findOrCreate({
      where: { name: ingredientName },
      defaults: {
        code: ingredientName.replace(/\s+/g, '_').toUpperCase(),
        name: ingredientName,
        unit: 'Gram', // Default unit
        description: `Bahan ${ingredientName} untuk resep Sajati`
      }
    });
  }
  
  console.log(`Imported ${ingredients.size} additional ingredients`);
}

// Function to import recipes
async function importRecipes() {
  console.log('Importing recipes...');
  
  const recipeFiles = [
    { file: path.join(DATA_DIR, 'Resep Makanan-Resep Makanan.csv'), type: 'Makanan' },
    { file: path.join(DATA_DIR, 'Resep Kopi-Resep Coffee.csv'), type: 'Kopi' },
    { file: path.join(DATA_DIR, 'Resep Non Kopi-Resep Non Coffee.csv'), type: 'Non Kopi' }
  ];
  
  for (const { file, type } of recipeFiles) {
    try {
      const data = await parseCSV(file);
      let currentProduct = null;
      let currentRecipe = null;
      let recipeCount = 0;
      
      console.log(`Processing ${type} recipes from ${path.basename(file)}...`);
      
      for (const row of data) {
        // Map columns based on file type
        let namaProduk, resep, qtyProduksi, volume;
        
        if (type === 'Makanan') {
          namaProduk = row['Resep Makanan'];
          resep = row['_1'];
          qtyProduksi = row['_2'];
          volume = row['_3'];
        } else if (type === 'Kopi') {
          namaProduk = row['Resep Coffee'];
          resep = row['_1'];
          qtyProduksi = row['_2'];
          volume = row['_3'];
        } else { // Non Kopi
          namaProduk = row['Resep Non Coffee'];
          resep = row['_1'];
          qtyProduksi = row['_2'];
          volume = row['_3'];
        }
        
        // Check if this is a product header (Nama Produk column has value)
        if (namaProduk && namaProduk.trim() !== '' && namaProduk !== 'Nama Produk') {
          currentProduct = namaProduk.trim();
          
          // Find the product in database
          const product = await allModels.RecipeProduct.findOne({
            where: { name: currentProduct }
          });
          
          if (product) {
            // Create recipe for this product
            const [recipe] = await allModels.Recipe.findOrCreate({
              where: { productId: product.id },
              defaults: {
                productId: product.id,
                version: '1.0',
                yieldQuantity: 1,
                notes: `Resep ${type} untuk ${currentProduct}`,
                isActive: true
              }
            });
            currentRecipe = recipe;
            recipeCount++;
            console.log(`Created recipe for: ${currentProduct}`);
          } else {
            console.warn(`Product not found: ${currentProduct}`);
            currentRecipe = null;
          }
        }
        
        // Process ingredients for current recipe
        if (currentRecipe && resep && resep.trim() !== '' && resep !== 'Resep') {
          const ingredientName = resep.trim();
          const quantity = parseFloat(qtyProduksi?.replace(',', '.')) || 0;
          const unit = volume || 'Gram';
          
          if (ingredientName && quantity > 0) {
            // First check if this is a PG (sub-recipe)
            const pgProduct = await allModels.RecipeProduct.findOne({
              where: { name: ingredientName },
              include: [{
                model: allModels.ProductCategory,
                as: 'category',
                where: { type: 'PG' }
              }]
            });
            
            if (pgProduct) {
              // This is a PG, find its recipe
              const pgRecipe = await allModels.Recipe.findOne({
                where: { productId: pgProduct.id }
              });
              
              if (pgRecipe) {
                await allModels.RecipeIngredient.findOrCreate({
                  where: {
                    recipeId: currentRecipe.id,
                    subRecipeId: pgRecipe.id
                  },
                  defaults: {
                    recipeId: currentRecipe.id,
                    subRecipeId: pgRecipe.id,
                    quantity: quantity,
                    unit: unit,
                    notes: `PG: ${ingredientName}`
                  }
                });
                console.log(`Added PG ${ingredientName} to recipe`);
              }
            } else {
              // This is a regular raw material
              const ingredient = await allModels.RawMaterial.findOne({
                where: { name: ingredientName }
              });
              
              if (ingredient) {
                await allModels.RecipeIngredient.findOrCreate({
                  where: {
                    recipeId: currentRecipe.id,
                    materialId: ingredient.id
                  },
                  defaults: {
                    recipeId: currentRecipe.id,
                    materialId: ingredient.id,
                    quantity: quantity,
                    unit: unit
                  }
                });
                console.log(`Added ingredient ${ingredientName} to recipe`);
              } else {
                console.warn(`Ingredient not found: ${ingredientName}`);
              }
            }
          }
        }
      }
      
      console.log(`Completed ${type} recipes: ${recipeCount} recipes created`);
    } catch (error) {
      console.error(`Error importing recipes from ${file}:`, error);
    }
  }
  
  console.log('Recipes imported successfully');
}

// Main import function
async function importSajatiData() {
  try {
    console.log('Starting Sajati data import...');
    
    // Force sync database to recreate tables
    console.log('Recreating database tables...');
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');
    
    // Import data in sequence
    await importMenuData();
    await importPGData();
    await importIngredients();
    await importRecipes();
    
    console.log('\n=== Sajati Smart System Data Import Completed ===');
    console.log('All data has been successfully imported to the database.');
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the import
if (require.main === module) {
  importSajatiData();
}

module.exports = { importSajatiData };