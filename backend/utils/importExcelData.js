const fs = require('fs');
const path = require('path');
const {
  RawMaterial,
  ProductCategory,
  RecipeProduct,
  Recipe,
  RecipeIngredient,
  CurrentStock,
  InventoryTransaction,
  sequelize
} = require('../models/RecipeManagement');

// Import Excel data to database
class ExcelDataImporter {
  
  constructor() {
    this.dataPath = path.join(__dirname, '../data/final');
    this.stats = {
      rawMaterials: 0,
      categories: 0,
      products: 0,
      recipes: 0,
      recipeIngredients: 0,
      currentStock: 0,
      inventoryTransactions: 0
    };
  }

  // Main import function
  async importAll() {
    const transaction = await sequelize.transaction();
    
    try {
      console.log('🚀 Starting Excel data import...');
      
      // Import in correct order due to foreign key dependencies
      await this.importRawMaterials(transaction);
      await this.importProductCategories(transaction);
      await this.importProducts(transaction);
      await this.importRecipes(transaction);
      await this.importCurrentStock(transaction);
      await this.importPurchaseTransactions(transaction);
      
      await transaction.commit();
      
      console.log('✅ Import completed successfully!');
      console.log('📊 Import Statistics:');
      console.table(this.stats);
      
      return this.stats;
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Import failed:', error);
      throw error;
    }
  }

  // Import raw materials from inventory data
  async importRawMaterials(transaction) {
    try {
      console.log('📦 Importing raw materials...');
      
      const inventoryData = this.loadJsonFile('inventory.json');
      const rawMaterialsMap = new Map();
      
      // Extract unique materials from inventory
      inventoryData.forEach(item => {
        if (!rawMaterialsMap.has(item.materialCode)) {
          rawMaterialsMap.set(item.materialCode, {
            code: item.materialCode,
            name: item.materialName,
            category: this.categorizeRawMaterial(item.materialName),
            unit: item.unit || 'gram',
            minimumStock: item.minimumStock || 100,
            isActive: true
          });
        }
      });

      // Also extract from recipes
      const recipesData = this.loadJsonFile('recipes.json');
      recipesData.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
          if (ingredient.code && !rawMaterialsMap.has(ingredient.code)) {
            rawMaterialsMap.set(ingredient.code, {
              code: ingredient.code,
              name: ingredient.name || ingredient.description,
              category: this.categorizeRawMaterial(ingredient.name || ingredient.description),
              unit: ingredient.unit || 'gram',
              minimumStock: 100,
              isActive: true
            });
          }
        });
      });

      // Bulk create raw materials
      const rawMaterials = Array.from(rawMaterialsMap.values());
      await RawMaterial.bulkCreate(rawMaterials, {
        transaction,
        ignoreDuplicates: true
      });
      
      this.stats.rawMaterials = rawMaterials.length;
      console.log(`✅ Imported ${rawMaterials.length} raw materials`);
    } catch (error) {
      console.error('❌ Error importing raw materials:', error);
      throw error;
    }
  }

  // Import product categories
  async importProductCategories(transaction) {
    try {
      console.log('📂 Importing product categories...');
      
      const categories = [
        { type: 'PG', name: 'Racikan Bumbu', description: 'Bumbu racikan untuk berbagai produk' },
        { type: 'LM', name: 'Light Meal', description: 'Menu makanan ringan' },
        { type: 'MC', name: 'Main Course', description: 'Menu makanan utama' },
        { type: 'CO', name: 'Coffee Based', description: 'Menu berbasis kopi' },
        { type: 'NC', name: 'Non Coffee', description: 'Menu non-kopi' },
        { type: 'OTHER', name: 'Lainnya', description: 'Kategori lainnya' }
      ];

      await ProductCategory.bulkCreate(categories, {
        transaction,
        ignoreDuplicates: true
      });
      
      this.stats.categories = categories.length;
      console.log(`✅ Imported ${categories.length} product categories`);
    } catch (error) {
      console.error('❌ Error importing categories:', error);
      throw error;
    }
  }

  // Import products
  async importProducts(transaction) {
    try {
      console.log('🍽️ Importing products...');
      
      const productsData = this.loadJsonFile('products.json');
      const categories = await ProductCategory.findAll({ transaction });
      const categoryMap = new Map(categories.map(cat => [cat.type, cat.id]));
      
      const products = productsData.map(product => ({
        sku: product.sku,
        name: product.name,
        categoryId: categoryMap.get(product.category) || categoryMap.get('OTHER'),
        sellingPrice: this.parseNumber(product.sellingPrice),
        costPrice: this.parseNumber(product.hpp),
        marginPercent: this.parseNumber(product.marginPercent),
        isActive: true
      }));

      await RecipeProduct.bulkCreate(products, {
        transaction,
        ignoreDuplicates: true
      });
      
      this.stats.products = products.length;
      console.log(`✅ Imported ${products.length} products`);
    } catch (error) {
      console.error('❌ Error importing products:', error);
      throw error;
    }
  }

  // Import recipes and recipe ingredients
  async importRecipes(transaction) {
    try {
      console.log('📝 Importing recipes...');
      
      const recipesData = this.loadJsonFile('recipes.json');
      const products = await Product.findAll({ transaction });
      const rawMaterials = await RawMaterial.findAll({ transaction });
      
      const productMap = new Map(products.map(p => [p.sku, p.id]));
      const materialMap = new Map(rawMaterials.map(m => [m.code, m.id]));
      
      let recipeCount = 0;
      let ingredientCount = 0;
      
      for (const recipeData of recipesData) {
        // Find product by name or create a generic product
        let productId = null;
        
        // Try to find product by SKU first
        if (recipeData.productCode) {
          productId = productMap.get(recipeData.productCode);
        }
        
        // If not found, try to find by name
        if (!productId) {
          const product = products.find(p => 
            p.name.toLowerCase().includes(recipeData.productName.toLowerCase()) ||
            recipeData.productName.toLowerCase().includes(p.name.toLowerCase())
          );
          productId = product?.id;
        }
        
        // If still not found, create a new product
        if (!productId) {
          const newProduct = await Product.create({
            sku: recipeData.productCode || `AUTO_${Date.now()}`,
            name: recipeData.productName,
            categoryId: 1, // Default to first category
            sellingPrice: 0,
            costPrice: this.parseNumber(recipeData.totalCost),
            marginPercent: 0,
            isActive: true
          }, { transaction });
          productId = newProduct.id;
          this.stats.products++;
        }
        
        // Create recipe
        const recipe = await Recipe.create({
          productId,
          name: recipeData.productName,
          category: recipeData.category,
          yield: this.parseNumber(recipeData.yield) || 1,
          totalCost: this.parseNumber(recipeData.totalCost),
          isActive: true
        }, { transaction });
        
        recipeCount++;
        
        // Create recipe ingredients
        for (const ingredient of recipeData.ingredients) {
          let materialId = materialMap.get(ingredient.code);
          
          // If material not found, create it
          if (!materialId && ingredient.code) {
            const newMaterial = await RawMaterial.create({
              code: ingredient.code,
              name: ingredient.name || ingredient.description,
              category: this.categorizeRawMaterial(ingredient.name || ingredient.description),
              unit: ingredient.unit || 'gram',
              minimumStock: 100,
              isActive: true
            }, { transaction });
            materialId = newMaterial.id;
            materialMap.set(ingredient.code, materialId);
            this.stats.rawMaterials++;
          }
          
          if (materialId) {
            await RecipeIngredient.create({
              recipeId: recipe.id,
              materialId,
              quantity: this.parseNumber(ingredient.quantity),
              unit: ingredient.unit || 'gram',
              unitCost: this.parseNumber(ingredient.unitCost),
              totalCost: this.parseNumber(ingredient.totalCost)
            }, { transaction });
            
            ingredientCount++;
          }
        }
      }
      
      this.stats.recipes = recipeCount;
      this.stats.recipeIngredients = ingredientCount;
      console.log(`✅ Imported ${recipeCount} recipes with ${ingredientCount} ingredients`);
    } catch (error) {
      console.error('❌ Error importing recipes:', error);
      throw error;
    }
  }

  // Import current stock
  async importCurrentStock(transaction) {
    try {
      console.log('📊 Importing current stock...');
      
      const inventoryData = this.loadJsonFile('inventory.json');
      const rawMaterials = await RawMaterial.findAll({ transaction });
      const materialMap = new Map(rawMaterials.map(m => [m.code, m.id]));
      
      const stockData = inventoryData
        .filter(item => materialMap.has(item.materialCode))
        .map(item => ({
          materialId: materialMap.get(item.materialCode),
          quantity: this.parseNumber(item.currentStock),
          unit: item.unit || 'gram',
          lastUpdated: new Date()
        }));

      await CurrentStock.bulkCreate(stockData, {
        transaction,
        ignoreDuplicates: true
      });
      
      this.stats.currentStock = stockData.length;
      console.log(`✅ Imported ${stockData.length} stock records`);
    } catch (error) {
      console.error('❌ Error importing current stock:', error);
      throw error;
    }
  }

  // Import purchase transactions
  async importPurchaseTransactions(transaction) {
    try {
      console.log('🛒 Importing purchase transactions...');
      
      const purchaseData = this.loadJsonFile('purchases.json');
      const rawMaterials = await RawMaterial.findAll({ transaction });
      const materialMap = new Map(rawMaterials.map(m => [m.name.toLowerCase(), m.id]));
      
      const transactions = [];
      
      for (const purchase of purchaseData) {
        // Try to find material by name
        const materialName = purchase.materialName?.toLowerCase();
        const materialId = materialMap.get(materialName);
        
        if (materialId) {
          transactions.push({
            materialId,
            transactionType: 'IN',
            quantity: this.parseNumber(purchase.quantity),
            unit: purchase.unit || 'gram',
            unitCost: this.parseNumber(purchase.unitPrice),
            totalCost: this.parseNumber(purchase.totalPrice),
            referenceType: 'PURCHASE',
            referenceId: purchase.id || null,
            notes: `Purchase: ${purchase.description || 'Imported from Excel'}`,
            transactionDate: purchase.date ? new Date(purchase.date) : new Date(),
            createdBy: 'SYSTEM'
          });
        }
      }

      if (transactions.length > 0) {
        await InventoryTransaction.bulkCreate(transactions, {
          transaction,
          ignoreDuplicates: true
        });
      }
      
      this.stats.inventoryTransactions = transactions.length;
      console.log(`✅ Imported ${transactions.length} purchase transactions`);
    } catch (error) {
      console.error('❌ Error importing purchase transactions:', error);
      throw error;
    }
  }

  // Utility functions
  loadJsonFile(filename) {
    try {
      const filePath = path.join(this.dataPath, filename);
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.warn(`⚠️ Could not load ${filename}:`, error.message);
      return [];
    }
  }

  parseNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove currency symbols and commas
      const cleaned = value.replace(/[Rp.,\s]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  categorizeRawMaterial(name) {
    if (!name) return 'OTHER';
    
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('tepung') || lowerName.includes('flour')) return 'FLOUR';
    if (lowerName.includes('mie') || lowerName.includes('noodle')) return 'NOODLE';
    if (lowerName.includes('beras') || lowerName.includes('rice')) return 'RICE';
    if (lowerName.includes('sayur') || lowerName.includes('vegetable')) return 'VEGETABLE';
    if (lowerName.includes('daging') || lowerName.includes('meat') || lowerName.includes('ayam') || lowerName.includes('sapi')) return 'MEAT';
    if (lowerName.includes('bumbu') || lowerName.includes('spice')) return 'SPICE';
    if (lowerName.includes('minyak') || lowerName.includes('oil')) return 'OIL';
    if (lowerName.includes('gula') || lowerName.includes('sugar')) return 'SWEETENER';
    if (lowerName.includes('susu') || lowerName.includes('milk') || lowerName.includes('cream')) return 'DAIRY';
    if (lowerName.includes('kopi') || lowerName.includes('coffee')) return 'BEVERAGE';
    
    return 'OTHER';
  }
}

// CLI execution
if (require.main === module) {
  const importer = new ExcelDataImporter();
  
  importer.importAll()
    .then(stats => {
      console.log('\n🎉 Import completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Import failed:', error);
      process.exit(1);
    });
}

module.exports = ExcelDataImporter;