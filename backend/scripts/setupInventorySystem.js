const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const ProductCompositionImporter = require('./importProductCompositions');

// Path ke database dan file schema
const dbPath = path.join(__dirname, '../database/sajati_smart_system.db');
const schemaPath = path.join(__dirname, '../database/inventory_tracking_schema.sql');

class InventorySystemSetup {
  constructor() {
    this.db = new sqlite3.Database(dbPath);
  }

  async setupCompleteSystem() {
    try {
      console.log('🚀 Starting Complete Inventory System Setup...');
      console.log('=' .repeat(60));
      
      // 1. Run database migration
      await this.runDatabaseMigration();
      
      // 2. Import product compositions
      await this.importProductData();
      
      // 3. Test system functionality
      await this.testSystemFunctionality();
      
      // 4. Generate initial reports
      await this.generateInitialReports();
      
      console.log('\n' + '=' .repeat(60));
      console.log('🎉 Complete Inventory System Setup Finished!');
      console.log('=' .repeat(60));
      
    } catch (error) {
      console.error('❌ Setup failed:', error);
      throw error;
    }
  }

  async runDatabaseMigration() {
    console.log('\n📊 Step 1: Running Database Migration...');
    
    try {
      // Read schema file
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split schema into individual statements
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      console.log(`📝 Executing ${statements.length} SQL statements...`);
      
      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          try {
            await this.executeQuery(statement);
            if (i % 10 === 0) {
              console.log(`   ✅ Executed ${i + 1}/${statements.length} statements`);
            }
          } catch (error) {
            if (!error.message.includes('already exists')) {
              console.warn(`   ⚠️ Warning on statement ${i + 1}: ${error.message}`);
            }
          }
        }
      }
      
      console.log('✅ Database migration completed successfully');
      
    } catch (error) {
      console.error('❌ Database migration failed:', error);
      throw error;
    }
  }

  async importProductData() {
    console.log('\n📦 Step 2: Importing Product Composition Data...');
    
    try {
      const importer = new ProductCompositionImporter();
      await importer.importCompositions();
      importer.close();
      
      console.log('✅ Product composition data imported successfully');
      
    } catch (error) {
      console.error('❌ Product data import failed:', error);
      throw error;
    }
  }

  async testSystemFunctionality() {
    console.log('\n🧪 Step 3: Testing System Functionality...');
    
    try {
      // Test 1: Check if views are working
      console.log('   🔍 Testing database views...');
      const viewTests = [
        { name: 'product_full_composition', description: 'Product composition view' },
        { name: 'current_stock_status', description: 'Stock status view' },
        { name: 'daily_sales_summary', description: 'Daily sales summary view' }
      ];
      
      for (const test of viewTests) {
        try {
          const result = await this.executeQuery(`SELECT COUNT(*) as count FROM ${test.name}`);
          console.log(`     ✅ ${test.description}: ${result[0].count} records`);
        } catch (error) {
          console.log(`     ❌ ${test.description}: ${error.message}`);
        }
      }
      
      // Test 2: Simulate a sale transaction
      console.log('   💰 Testing sale transaction simulation...');
      await this.simulateTestTransaction();
      
      // Test 3: Check stock levels
      console.log('   📊 Testing stock level calculations...');
      const stockSummary = await this.executeQuery(`
        SELECT 
          stock_status,
          COUNT(*) as count,
          ROUND(AVG(current_quantity), 2) as avg_quantity
        FROM current_stock_status 
        GROUP BY stock_status
      `);
      
      console.log('     📈 Stock Status Summary:');
      stockSummary.forEach(status => {
        console.log(`       ${status.stock_status}: ${status.count} items (avg: ${status.avg_quantity})`);
      });
      
      console.log('✅ System functionality tests completed');
      
    } catch (error) {
      console.error('❌ System functionality test failed:', error);
      throw error;
    }
  }

  async simulateTestTransaction() {
    try {
      // Get a sample product
      const products = await this.executeQuery(`
        SELECT p.id, p.name, p.price 
        FROM products p 
        WHERE p.name LIKE '%Nasi%' 
        LIMIT 1
      `);
      
      if (products.length === 0) {
        console.log('     ⚠️ No products found for testing');
        return;
      }
      
      const product = products[0];
      const testQuantity = 2;
      
      console.log(`     🛒 Simulating sale: ${testQuantity}x ${product.name}`);
      
      // Check stock before
      const stockBefore = await this.executeQuery(`
        SELECT rm.name, rms.current_quantity, rms.unit
        FROM raw_material_stock rms
        JOIN raw_materials rm ON rms.raw_material_id = rm.id
        WHERE rms.current_quantity > 0
        LIMIT 5
      `);
      
      console.log('     📦 Stock levels before transaction:');
      stockBefore.forEach(stock => {
        console.log(`       ${stock.name}: ${stock.current_quantity} ${stock.unit}`);
      });
      
      // Insert test transaction
      const transactionId = await this.insertTestTransaction(product, testQuantity);
      
      // Check stock after
      const stockAfter = await this.executeQuery(`
        SELECT rm.name, rms.current_quantity, rms.unit
        FROM raw_material_stock rms
        JOIN raw_materials rm ON rms.raw_material_id = rm.id
        WHERE rm.name IN (${stockBefore.map(() => '?').join(',')})
      `, stockBefore.map(s => s.name));
      
      console.log('     📦 Stock levels after transaction:');
      stockAfter.forEach(stock => {
        const before = stockBefore.find(s => s.name === stock.name);
        const change = before ? (stock.current_quantity - before.current_quantity) : 0;
        console.log(`       ${stock.name}: ${stock.current_quantity} ${stock.unit} (${change >= 0 ? '+' : ''}${change})`);
      });
      
      console.log(`     ✅ Test transaction completed (ID: ${transactionId})`);
      
    } catch (error) {
      console.error('     ❌ Transaction simulation failed:', error);
    }
  }

  async insertTestTransaction(product, quantity) {
    // Insert transaction
    const transactionResult = await this.executeQuery(`
      INSERT INTO transactions (
        transaction_number, transaction_date, total_amount, 
        tax_amount, discount_amount, final_amount, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      `TEST-${Date.now()}`,
      new Date().toISOString(),
      product.price * quantity,
      product.price * quantity * 0.1, // 10% tax
      0, // no discount
      product.price * quantity * 1.1, // total with tax
      'completed'
    ]);
    
    const transactionId = await this.executeQuery('SELECT last_insert_rowid() as id');
    const txId = transactionId[0].id;
    
    // Insert transaction item
    await this.executeQuery(`
      INSERT INTO transaction_items (
        transaction_id, product_id, quantity, unit_price, subtotal
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      txId,
      product.id,
      quantity,
      product.price,
      product.price * quantity
    ]);
    
    return txId;
  }

  async generateInitialReports() {
    console.log('\n📋 Step 4: Generating Initial Reports...');
    
    try {
      // Stock Status Report
      console.log('   📊 Stock Status Report:');
      const stockReport = await this.executeQuery(`
        SELECT 
          rm.name,
          rms.current_quantity,
          rms.unit,
          rms.minimum_stock,
          CASE 
            WHEN rms.current_quantity <= 0 THEN 'OUT_OF_STOCK'
            WHEN rms.current_quantity <= rms.minimum_stock THEN 'LOW_STOCK'
            ELSE 'ADEQUATE'
          END as status
        FROM raw_material_stock rms
        JOIN raw_materials rm ON rms.raw_material_id = rm.id
        ORDER BY 
          CASE 
            WHEN rms.current_quantity <= 0 THEN 1
            WHEN rms.current_quantity <= rms.minimum_stock THEN 2
            ELSE 3
          END,
          rm.name
        LIMIT 10
      `);
      
      stockReport.forEach(item => {
        const statusIcon = {
          'OUT_OF_STOCK': '🔴',
          'LOW_STOCK': '🟡',
          'ADEQUATE': '🟢'
        }[item.status];
        
        console.log(`     ${statusIcon} ${item.name}: ${item.current_quantity}/${item.minimum_stock} ${item.unit}`);
      });
      
      // Product Composition Report
      console.log('\n   🍽️ Product Composition Summary:');
      const compositionReport = await this.executeQuery(`
        SELECT 
          p.name as product_name,
          COUNT(DISTINCT pc.raw_material_id) as direct_ingredients,
          COUNT(DISTINCT pc.pg_product_id) as pg_components
        FROM products p
        LEFT JOIN product_compositions pc ON p.id = pc.product_id
        WHERE p.is_active = 1
        GROUP BY p.id, p.name
        HAVING (direct_ingredients > 0 OR pg_components > 0)
        ORDER BY p.name
        LIMIT 10
      `);
      
      compositionReport.forEach(item => {
        console.log(`     🍽️ ${item.product_name}: ${item.direct_ingredients} direct + ${item.pg_components} PG`);
      });
      
      // System Statistics
      console.log('\n   📈 System Statistics:');
      const stats = await this.executeQuery(`
        SELECT 
          (SELECT COUNT(*) FROM raw_materials) as raw_materials,
          (SELECT COUNT(*) FROM products WHERE is_active = 1) as active_products,
          (SELECT COUNT(*) FROM product_compositions) as composition_records,
          (SELECT COUNT(*) FROM pg_compositions) as pg_records,
          (SELECT COUNT(*) FROM raw_material_stock) as stock_records
      `);
      
      const stat = stats[0];
      console.log(`     📦 Raw Materials: ${stat.raw_materials}`);
      console.log(`     🍽️ Active Products: ${stat.active_products}`);
      console.log(`     🔗 Composition Records: ${stat.composition_records}`);
      console.log(`     🔧 PG Records: ${stat.pg_records}`);
      console.log(`     📊 Stock Records: ${stat.stock_records}`);
      
      console.log('✅ Initial reports generated successfully');
      
    } catch (error) {
      console.error('❌ Report generation failed:', error);
      throw error;
    }
  }

  async executeQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    this.db.close();
  }
}

// Main execution
async function main() {
  const setup = new InventorySystemSetup();
  
  try {
    await setup.setupCompleteSystem();
    
    console.log('\n🎯 Next Steps:');
    console.log('1. 🔧 Run: node backend/scripts/setupInventorySystem.js');
    console.log('2. 🚀 Start your application server');
    console.log('3. 📊 Access inventory tracking endpoints');
    console.log('4. 💰 Process real transactions to see automatic stock updates');
    console.log('\n📚 Available API Endpoints:');
    console.log('   GET /api/inventory/stock-status - Current stock levels');
    console.log('   GET /api/inventory/stock-movements - Stock movement history');
    console.log('   GET /api/inventory/daily-summary - Daily sales summary');
    console.log('   GET /api/inventory/dashboard - Dashboard data');
    console.log('   POST /api/inventory/update-stock - Manual stock updates');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    setup.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = InventorySystemSetup;