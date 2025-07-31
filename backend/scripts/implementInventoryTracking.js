const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path ke database
const dbPath = path.join(__dirname, '../database/sajati_smart_system.db');
const schemaPath = path.join(__dirname, '../database/inventory_tracking_schema.sql');

class InventoryTrackingImplementation {
  constructor() {
    this.db = new sqlite3.Database(dbPath);
  }

  async implementSchema() {
    try {
      console.log('🚀 Starting Inventory Tracking System Implementation...');
      
      // 1. Baca dan jalankan schema SQL
      await this.executeSchemaFile();
      
      // 2. Migrate existing data
      await this.migrateExistingData();
      
      // 3. Setup initial compositions from CSV data
      await this.setupProductCompositions();
      
      // 4. Setup initial stock levels
      await this.setupInitialStock();
      
      // 5. Verify implementation
      await this.verifyImplementation();
      
      console.log('✅ Inventory Tracking System implemented successfully!');
      
    } catch (error) {
      console.error('❌ Error implementing Inventory Tracking System:', error);
      throw error;
    }
  }

  async executeSchemaFile() {
    return new Promise((resolve, reject) => {
      console.log('📄 Reading and executing schema file...');
      
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      this.db.exec(schemaSQL, (err) => {
        if (err) {
          console.error('Error executing schema:', err);
          reject(err);
        } else {
          console.log('✅ Schema executed successfully');
          resolve();
        }
      });
    });
  }

  async migrateExistingData() {
    console.log('🔄 Migrating existing data...');
    
    // Migrate raw materials if not exists
    await this.executeQuery(`
      INSERT OR IGNORE INTO raw_materials (id, code, name, category, unit, current_price, minimum_stock)
      SELECT 
        ROW_NUMBER() OVER (ORDER BY name) as id,
        'RM' || printf('%03d', ROW_NUMBER() OVER (ORDER BY name)) as code,
        name,
        'General' as category,
        unit,
        0.01 as current_price,
        100 as minimum_stock
      FROM (
        SELECT DISTINCT 
          'Air' as name, 'ml' as unit
        UNION SELECT 'Beras', 'Gram'
        UNION SELECT 'Kailan', 'Gram'
        UNION SELECT 'Beef Slice', 'Gram'
        UNION SELECT 'Bawang Merah', 'Gram'
        UNION SELECT 'Ayam Suwir', 'Gram'
        UNION SELECT 'Telur Ayam', 'Pcs'
        UNION SELECT 'Minyak Goreng', 'ml'
        UNION SELECT 'Garam', 'Gram'
        UNION SELECT 'Merica', 'Gram'
      )
    `);
    
    console.log('✅ Raw materials migrated');
  }

  async setupProductCompositions() {
    console.log('🍽️ Setting up product compositions...');
    
    // Setup PG Compositions (contoh untuk Kailan Crispy)
    await this.executeQuery(`
      INSERT OR IGNORE INTO pg_compositions (pg_product_id, raw_material_id, quantity_per_batch, unit, batch_yield)
      SELECT 
        p.id as pg_product_id,
        rm.id as raw_material_id,
        CASE rm.name
          WHEN 'Kailan' THEN 100
          WHEN 'Air' THEN 40
          WHEN 'Bawang Merah' THEN 20
          WHEN 'Minyak Goreng' THEN 30
          WHEN 'Garam' THEN 5
        END as quantity_per_batch,
        rm.unit,
        10 as batch_yield
      FROM products p
      CROSS JOIN raw_materials rm
      WHERE p.sku LIKE 'PG%' 
        AND p.name LIKE '%Kailan%Crispy%'
        AND rm.name IN ('Kailan', 'Air', 'Bawang Merah', 'Minyak Goreng', 'Garam')
    `);
    
    // Setup Product Compositions untuk produk yang menggunakan bahan baku langsung
    await this.executeQuery(`
      INSERT OR IGNORE INTO product_compositions (product_id, raw_material_id, quantity_per_portion, unit)
      SELECT 
        p.id as product_id,
        rm.id as raw_material_id,
        CASE 
          WHEN p.name LIKE '%Nasi%' AND rm.name = 'Beras' THEN 150
          WHEN p.name LIKE '%Sapi%' AND rm.name = 'Beef Slice' THEN 80
          WHEN p.name LIKE '%Ayam%' AND rm.name = 'Ayam Suwir' THEN 100
          WHEN p.name LIKE '%Telur%' AND rm.name = 'Telur Ayam' THEN 2
          ELSE 50
        END as quantity_per_portion,
        rm.unit
      FROM products p
      CROSS JOIN raw_materials rm
      WHERE p.sku NOT LIKE 'PG%'
        AND (
          (p.name LIKE '%Nasi%' AND rm.name = 'Beras') OR
          (p.name LIKE '%Sapi%' AND rm.name = 'Beef Slice') OR
          (p.name LIKE '%Ayam%' AND rm.name = 'Ayam Suwir') OR
          (p.name LIKE '%Telur%' AND rm.name = 'Telur Ayam')
        )
    `);
    
    // Setup PG dalam produk (contoh: Kailan Crispy dalam Nasi Oseng Sapi)
    await this.executeQuery(`
      INSERT OR IGNORE INTO product_compositions (product_id, pg_product_id, quantity_per_portion, unit)
      SELECT 
        p1.id as product_id,
        p2.id as pg_product_id,
        1 as quantity_per_portion,
        'Porsi' as unit
      FROM products p1
      CROSS JOIN products p2
      WHERE p1.name LIKE '%Nasi%Oseng%Sapi%'
        AND p2.sku LIKE 'PG%'
        AND p2.name LIKE '%Kailan%Crispy%'
    `);
    
    console.log('✅ Product compositions setup completed');
  }

  async setupInitialStock() {
    console.log('📦 Setting up initial stock levels...');
    
    await this.executeQuery(`
      INSERT OR IGNORE INTO raw_material_stock (raw_material_id, current_quantity, unit, minimum_stock)
      SELECT 
        rm.id,
        CASE rm.name
          WHEN 'Air' THEN 50000
          WHEN 'Beras' THEN 10000
          WHEN 'Kailan' THEN 5000
          WHEN 'Beef Slice' THEN 3000
          WHEN 'Bawang Merah' THEN 2000
          WHEN 'Ayam Suwir' THEN 4000
          WHEN 'Telur Ayam' THEN 100
          WHEN 'Minyak Goreng' THEN 5000
          WHEN 'Garam' THEN 1000
          WHEN 'Merica' THEN 500
          ELSE 1000
        END as current_quantity,
        rm.unit,
        CASE rm.name
          WHEN 'Air' THEN 10000
          WHEN 'Beras' THEN 2000
          WHEN 'Kailan' THEN 1000
          WHEN 'Beef Slice' THEN 500
          WHEN 'Bawang Merah' THEN 300
          WHEN 'Ayam Suwir' THEN 800
          WHEN 'Telur Ayam' THEN 20
          WHEN 'Minyak Goreng' THEN 1000
          WHEN 'Garam' THEN 200
          WHEN 'Merica' THEN 100
          ELSE 200
        END as minimum_stock
      FROM raw_materials rm
    `);
    
    console.log('✅ Initial stock levels setup completed');
  }

  async verifyImplementation() {
    console.log('🔍 Verifying implementation...');
    
    // Check tables created
    const tables = await this.executeQuery(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
        AND name IN (
          'product_compositions', 
          'pg_compositions', 
          'raw_material_stock', 
          'stock_movements',
          'daily_inventory_summary',
          'daily_sales_summary',
          'daily_product_sales'
        )
    `);
    
    console.log('📋 Tables created:', tables.map(t => t.name));
    
    // Check views created
    const views = await this.executeQuery(`
      SELECT name FROM sqlite_master 
      WHERE type='view' 
        AND name IN (
          'product_full_composition',
          'current_stock_status',
          'daily_sales_analysis',
          'product_cogs_calculation'
        )
    `);
    
    console.log('👁️ Views created:', views.map(v => v.name));
    
    // Check triggers created
    const triggers = await this.executeQuery(`
      SELECT name FROM sqlite_master 
      WHERE type='trigger'
        AND name IN (
          'auto_reduce_stock_on_sale',
          'update_daily_sales_summary',
          'update_daily_product_sales'
        )
    `);
    
    console.log('⚡ Triggers created:', triggers.map(t => t.name));
    
    // Check data counts
    const rawMaterialsCount = await this.executeQuery('SELECT COUNT(*) as count FROM raw_materials');
    const stockCount = await this.executeQuery('SELECT COUNT(*) as count FROM raw_material_stock');
    const compositionsCount = await this.executeQuery('SELECT COUNT(*) as count FROM product_compositions');
    const pgCompositionsCount = await this.executeQuery('SELECT COUNT(*) as count FROM pg_compositions');
    
    console.log('📊 Data verification:');
    console.log(`   - Raw Materials: ${rawMaterialsCount[0].count}`);
    console.log(`   - Stock Records: ${stockCount[0].count}`);
    console.log(`   - Product Compositions: ${compositionsCount[0].count}`);
    console.log(`   - PG Compositions: ${pgCompositionsCount[0].count}`);
    
    // Test view functionality
    const stockStatus = await this.executeQuery('SELECT COUNT(*) as count FROM current_stock_status');
    console.log(`   - Stock Status View: ${stockStatus[0].count} records`);
    
    console.log('✅ Implementation verification completed');
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

  async testSystem() {
    console.log('🧪 Testing system with sample transaction...');
    
    try {
      // Create a test transaction
      const transactionId = 'test-' + Date.now();
      
      await this.executeQuery(`
        INSERT INTO transactions (
          id, transaction_number, transaction_date, 
          total_amount, tax_amount, discount_amount, final_amount,
          payment_status
        ) VALUES (?, ?, datetime('now'), 25000, 2500, 1000, 26500, 'paid')
      `, [transactionId, 'TEST-001']);
      
      // Get a sample product
      const products = await this.executeQuery(`
        SELECT id, name FROM products 
        WHERE sku NOT LIKE 'PG%' 
        LIMIT 1
      `);
      
      if (products.length > 0) {
        const productId = products[0].id;
        const productName = products[0].name;
        
        // Add transaction item
        await this.executeQuery(`
          INSERT INTO transaction_items (
            id, transaction_id, product_id, quantity, 
            unit_price, subtotal, product_name
          ) VALUES (?, ?, ?, 2, 12500, 25000, ?)
        `, ['test-item-' + Date.now(), transactionId, productId, productName]);
        
        console.log('✅ Test transaction created successfully');
        
        // Check stock movements
        const movements = await this.executeQuery(`
          SELECT COUNT(*) as count FROM stock_movements 
          WHERE reference_id = ?
        `, [transactionId]);
        
        console.log(`📦 Stock movements created: ${movements[0].count}`);
        
        // Check current stock status
        const stockStatus = await this.executeQuery(`
          SELECT name, current_quantity, unit, stock_status 
          FROM current_stock_status 
          LIMIT 5
        `);
        
        console.log('📊 Current stock status (sample):');
        stockStatus.forEach(stock => {
          console.log(`   - ${stock.name}: ${stock.current_quantity} ${stock.unit} (${stock.stock_status})`);
        });
        
        // Cleanup test data
        await this.executeQuery('DELETE FROM transaction_items WHERE transaction_id = ?', [transactionId]);
        await this.executeQuery('DELETE FROM transactions WHERE id = ?', [transactionId]);
        await this.executeQuery('DELETE FROM stock_movements WHERE reference_id = ?', [transactionId]);
        
        console.log('🧹 Test data cleaned up');
      }
      
    } catch (error) {
      console.error('❌ Error testing system:', error);
    }
  }

  close() {
    this.db.close();
  }
}

// Main execution
async function main() {
  const implementation = new InventoryTrackingImplementation();
  
  try {
    await implementation.implementSchema();
    await implementation.testSystem();
    
    console.log('\n🎉 Inventory Tracking System is ready!');
    console.log('\n📋 Next steps:');
    console.log('1. Import actual product compositions from CSV files');
    console.log('2. Setup real initial stock levels');
    console.log('3. Configure POS integration');
    console.log('4. Setup monitoring dashboard');
    
  } catch (error) {
    console.error('❌ Implementation failed:', error);
  } finally {
    implementation.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = InventoryTrackingImplementation;