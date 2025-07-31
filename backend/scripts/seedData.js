const { sequelize } = require('../config/database');
const {
  RawMaterial,
  ProductCategory,
  RecipeProduct,
  Recipe,
  RecipeIngredient,
  CurrentStock
} = require('../models/RecipeManagement');

async function seedData() {
  try {
    console.log('Starting database seeding...');
    
    // Sync database first - force recreate to fix schema issues
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');
    
    // Check if data already exists
    const categoryCount = await ProductCategory.count();
    if (categoryCount > 0) {
      console.log('Data already exists, skipping seed');
      return;
    }
    
    // Seed Product Categories
    const categories = await ProductCategory.bulkCreate([
      { id: 1, name: 'Sajati', type: 'SJ', description: 'Produk Sajati' },
      { id: 2, name: 'Lainnya', type: 'LM', description: 'Produk Lainnya' },
      { id: 3, name: 'Minuman', type: 'MC', description: 'Minuman' },
      { id: 4, name: 'Coffee', type: 'CO', description: 'Kopi' },
      { id: 5, name: 'Non Coffee', type: 'NC', description: 'Non Kopi' }
    ]);
    console.log('Product categories seeded');
    
    // Seed Raw Materials
    const rawMaterials = await RawMaterial.bulkCreate([
      {
        code: 'RM001',
        name: 'Tepung Terigu',
        category: 'Bahan Pokok',
        unit: 'kg',
        currentPrice: 12000,
        supplier: 'Supplier A',
        minimumStock: 10
      },
      {
        code: 'RM002',
        name: 'Gula Pasir',
        category: 'Bahan Pokok',
        unit: 'kg',
        currentPrice: 15000,
        supplier: 'Supplier B',
        minimumStock: 5
      },
      {
        code: 'RM003',
        name: 'Telur',
        category: 'Bahan Segar',
        unit: 'butir',
        currentPrice: 2000,
        supplier: 'Supplier C',
        minimumStock: 50
      },
      {
        code: 'RM004',
        name: 'Santan',
        category: 'Bahan Segar',
        unit: 'ml',
        currentPrice: 8000,
        supplier: 'Supplier D',
        minimumStock: 2
      },
      {
        code: 'RM005',
        name: 'Kopi Bubuk',
        category: 'Minuman',
        unit: 'kg',
        currentPrice: 80000,
        supplier: 'Supplier E',
        minimumStock: 2
      }
    ]);
    console.log('Raw materials seeded');
    
    // Seed Products
    const products = await RecipeProduct.bulkCreate([
      {
        sku: 'PG001',
        name: 'Sajati Original',
        categoryId: 1,
        hpp: 5000,
        additionalCost: 1000,
        totalCost: 6000,
        sellingPrice: 10000,
        margin: 4000,
        marginPercent: 40.00,
        isActive: true
      },
      {
        sku: 'PG002',
        name: 'Sajati Coklat',
        categoryId: 1,
        hpp: 6000,
        additionalCost: 1000,
        totalCost: 7000,
        sellingPrice: 12000,
        margin: 5000,
        marginPercent: 41.67,
        isActive: true
      },
      {
        sku: 'CO001',
        name: 'Kopi Hitam',
        categoryId: 4,
        hpp: 3000,
        additionalCost: 500,
        totalCost: 3500,
        sellingPrice: 8000,
        margin: 4500,
        marginPercent: 56.25,
        isActive: true
      }
    ]);
    console.log('Products seeded');
    
    // Seed Current Stock
    const currentStock = await CurrentStock.bulkCreate([
      { materialId: 1, quantity: 50, unit: 'kg' },
      { materialId: 2, quantity: 25, unit: 'kg' },
      { materialId: 3, quantity: 200, unit: 'butir' },
      { materialId: 4, quantity: 10, unit: 'liter' },
      { materialId: 5, quantity: 5, unit: 'kg' }
    ]);
    console.log('Current stock seeded');
    
    // Seed Recipes
    const recipes = await Recipe.bulkCreate([
      {
        productId: 1,
        version: '1.0',
        totalCost: 5000,
        yieldQuantity: 10,
        preparationTime: 30,
        notes: 'Resep sajati original standar',
        isActive: true
      },
      {
        productId: 2,
        version: '1.0',
        totalCost: 6000,
        yieldQuantity: 10,
        preparationTime: 35,
        notes: 'Resep sajati coklat',
        isActive: true
      },
      {
        productId: 3,
        version: '1.0',
        totalCost: 3000,
        yieldQuantity: 1,
        preparationTime: 5,
        notes: 'Resep kopi hitam',
        isActive: true
      }
    ]);
    console.log('Recipes seeded');
    
    // Seed Recipe Ingredients
    const recipeIngredients = await RecipeIngredient.bulkCreate([
      // Sajati Original
      { recipeId: 1, materialId: 1, quantity: 0.5, unit: 'kg', unitCost: 12000, totalCost: 6000 },
      { recipeId: 1, materialId: 2, quantity: 0.2, unit: 'kg', unitCost: 15000, totalCost: 3000 },
      { recipeId: 1, materialId: 3, quantity: 5, unit: 'butir', unitCost: 2000, totalCost: 10000 },
      { recipeId: 1, materialId: 4, quantity: 0.3, unit: 'liter', unitCost: 8000, totalCost: 2400 },
      
      // Sajati Coklat
      { recipeId: 2, materialId: 1, quantity: 0.5, unit: 'kg', unitCost: 12000, totalCost: 6000 },
      { recipeId: 2, materialId: 2, quantity: 0.25, unit: 'kg', unitCost: 15000, totalCost: 3750 },
      { recipeId: 2, materialId: 3, quantity: 6, unit: 'butir', unitCost: 2000, totalCost: 12000 },
      { recipeId: 2, materialId: 4, quantity: 0.3, unit: 'liter', unitCost: 8000, totalCost: 2400 },
      
      // Kopi Hitam
      { recipeId: 3, materialId: 5, quantity: 0.02, unit: 'kg', unitCost: 80000, totalCost: 1600 }
    ]);
    console.log('Recipe ingredients seeded');
    
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedData };