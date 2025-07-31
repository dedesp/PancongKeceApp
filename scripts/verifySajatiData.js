const { sequelize } = require('../backend/config/database');
const models = require('../backend/models');
const recipeModels = require('../backend/models/RecipeManagement');

// Combine all models
const allModels = { ...models, ...recipeModels };

async function verifySajatiData() {
  try {
    console.log('=== Verifikasi Data Sajati Smart System ===\n');
    
    // Check ProductCategory
    const categoryCount = await allModels.ProductCategory.count();
    console.log(`📂 Kategori Produk: ${categoryCount}`);
    
    if (categoryCount > 0) {
      const categories = await allModels.ProductCategory.findAll();
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.type})`);
      });
    }
    
    // Check RecipeProduct
    const productCount = await allModels.RecipeProduct.count();
    console.log(`\n🍽️  Produk: ${productCount}`);
    
    if (productCount > 0) {
      const products = await allModels.RecipeProduct.findAll({
        include: [{ model: allModels.ProductCategory, as: 'category' }],
        limit: 10
      });
      products.forEach(product => {
        console.log(`   - ${product.sku}: ${product.name} (${product.category?.name || 'No Category'})`);
      });
      if (productCount > 10) {
        console.log(`   ... dan ${productCount - 10} produk lainnya`);
      }
    }
    
    // Check RawMaterial
    const materialCount = await allModels.RawMaterial.count();
    console.log(`\n🥬 Bahan Baku: ${materialCount}`);
    
    if (materialCount > 0) {
      const materials = await allModels.RawMaterial.findAll({ limit: 10 });
      materials.forEach(material => {
        console.log(`   - ${material.code}: ${material.name} (${material.unit})`);
      });
      if (materialCount > 10) {
        console.log(`   ... dan ${materialCount - 10} bahan baku lainnya`);
      }
    }
    
    // Check Recipe
    const recipeCount = await allModels.Recipe.count();
    console.log(`\n📝 Resep: ${recipeCount}`);
    
    if (recipeCount > 0) {
      const recipes = await allModels.Recipe.findAll({
        include: [{ model: allModels.RecipeProduct, as: 'product' }],
        limit: 5
      });
      recipes.forEach(recipe => {
        console.log(`   - Resep untuk ${recipe.product?.name || 'Unknown'} (v${recipe.version})`);
      });
      if (recipeCount > 5) {
        console.log(`   ... dan ${recipeCount - 5} resep lainnya`);
      }
    }
    
    // Check RecipeIngredient
    const ingredientCount = await allModels.RecipeIngredient.count();
    console.log(`\n🧪 Komposisi Resep: ${ingredientCount}`);
    
    if (ingredientCount > 0) {
      const ingredients = await allModels.RecipeIngredient.findAll({
        include: [
          { model: allModels.Recipe, as: 'recipe', include: [{ model: allModels.RecipeProduct, as: 'product' }] },
          { model: allModels.RawMaterial, as: 'material' }
        ],
        limit: 10
      });
      ingredients.forEach(ing => {
        console.log(`   - ${ing.recipe?.product?.name || 'Unknown'}: ${ing.quantity} ${ing.unit} ${ing.material?.name || 'Unknown Material'}`);
      });
      if (ingredientCount > 10) {
        console.log(`   ... dan ${ingredientCount - 10} komposisi lainnya`);
      }
    }
    
    console.log('\n=== Verifikasi Selesai ===');
    
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await sequelize.close();
  }
}

// Run verification
if (require.main === module) {
  verifySajatiData();
}

module.exports = { verifySajatiData };