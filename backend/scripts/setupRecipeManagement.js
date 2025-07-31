const { sequelize } = require('../config/database');
const ExcelDataImporter = require('../utils/importExcelData');
const {
  RawMaterial,
  ProductCategory,
  RecipeProduct,
  Recipe,
  RecipeIngredient,
  CurrentStock,
  InventoryTransaction,
  SalesTransaction,
  SalesTransactionDetail,
  StockAlert
} = require('../models/RecipeManagement');

// Setup Recipe Management System
class RecipeManagementSetup {
  
  constructor() {
    this.models = {
      RawMaterial,
      ProductCategory,
      RecipeProduct,
      Recipe,
      RecipeIngredient,
      CurrentStock,
      InventoryTransaction,
      SalesTransaction,
      SalesTransactionDetail,
      StockAlert
    };
  }

  // Main setup function
  async setup() {
    try {
      console.log('🚀 Starting Recipe Management System Setup...');
      
      // Step 1: Test database connection
      await this.testConnection();
      
      // Step 2: Create tables
      await this.createTables();
      
      // Step 3: Import Excel data
      await this.importData();
      
      // Step 4: Verify setup
      await this.verifySetup();
      
      console.log('✅ Recipe Management System setup completed successfully!');
      console.log('\n📋 System is ready for:');
      console.log('   • Product management with recipes');
      console.log('   • Real-time inventory tracking');
      console.log('   • Auto stock deduction on sales');
      console.log('   • Cost calculation and profit analysis');
      console.log('   • Stock alerts and reporting');
      
      return true;
    } catch (error) {
      console.error('❌ Setup failed:', error);
      throw error;
    }
  }

  // Test database connection
  async testConnection() {
    try {
      console.log('🔌 Testing database connection...');
      await sequelize.authenticate();
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  // Create database tables
  async createTables() {
    try {
      console.log('🏗️ Creating database tables...');
      
      // Force sync to recreate tables (use with caution in production)
      const force = process.argv.includes('--force');
      
      if (force) {
        console.log('⚠️ Force mode: Dropping existing tables...');
      }
      
      await sequelize.sync({ force });
      
      console.log('✅ Database tables created successfully');
      
      // Log created tables
      const tableNames = Object.keys(this.models);
      console.log(`📊 Created ${tableNames.length} tables:`);
      tableNames.forEach(name => console.log(`   • ${name}`));
      
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  // Import Excel data
  async importData() {
    try {
      console.log('📥 Importing Excel data...');
      
      const importer = new ExcelDataImporter();
      const stats = await importer.importAll();
      
      console.log('✅ Data import completed');
      return stats;
    } catch (error) {
      console.error('❌ Error importing data:', error);
      // Don't throw error here, setup can continue without data
      console.log('⚠️ Continuing setup without data import...');
      return null;
    }
  }

  // Verify setup
  async verifySetup() {
    try {
      console.log('🔍 Verifying setup...');
      
      const counts = {};
      
      // Count records in each table
      for (const [modelName, model] of Object.entries(this.models)) {
        try {
          counts[modelName] = await model.count();
        } catch (error) {
          counts[modelName] = 'Error';
        }
      }
      
      console.log('📊 Database verification:');
      console.table(counts);
      
      // Check if basic data exists
      const hasCategories = counts.ProductCategory > 0;
      const hasProducts = counts.Product > 0;
      const hasRecipes = counts.Recipe > 0;
      
      if (hasCategories && hasProducts && hasRecipes) {
        console.log('✅ Setup verification passed - System ready for use');
      } else {
        console.log('⚠️ Setup verification warning - Some data may be missing');
        console.log('   You may need to manually add categories, products, or recipes');
      }
      
    } catch (error) {
      console.error('❌ Error during verification:', error);
      throw error;
    }
  }

  // Reset system (for development)
  async reset() {
    try {
      console.log('🔄 Resetting Recipe Management System...');
      
      // Drop all tables
      await sequelize.drop();
      console.log('✅ All tables dropped');
      
      // Recreate tables
      await this.createTables();
      
      console.log('✅ System reset completed');
    } catch (error) {
      console.error('❌ Error resetting system:', error);
      throw error;
    }
  }

  // Show help
  static showHelp() {
    console.log('\n📖 Recipe Management Setup Help');
    console.log('\nUsage:');
    console.log('  node scripts/setupRecipeManagement.js [options]');
    console.log('\nOptions:');
    console.log('  --force     Force recreate tables (drops existing data)');
    console.log('  --reset     Reset entire system (drops all tables)');
    console.log('  --help      Show this help message');
    console.log('\nExamples:');
    console.log('  node scripts/setupRecipeManagement.js');
    console.log('  node scripts/setupRecipeManagement.js --force');
    console.log('  node scripts/setupRecipeManagement.js --reset');
    console.log('');
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    RecipeManagementSetup.showHelp();
    process.exit(0);
  }
  
  const setup = new RecipeManagementSetup();
  
  if (args.includes('--reset')) {
    setup.reset()
      .then(() => {
        console.log('\n🎉 System reset completed!');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n💥 Reset failed:', error);
        process.exit(1);
      });
  } else {
    setup.setup()
      .then(() => {
        console.log('\n🎉 Setup completed successfully!');
        console.log('\n🚀 You can now start using the Recipe Management System:');
        console.log('   • API endpoints available at /api/recipe-management/*');
        console.log('   • Check the routes file for available endpoints');
        console.log('   • Use the controller methods for business logic');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n💥 Setup failed:', error);
        process.exit(1);
      });
  }
}

module.exports = RecipeManagementSetup;