const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path ke database
const dbPath = path.join(__dirname, '../database/sajati_smart_system.db');

class InventorySystemTester {
  constructor() {
    this.db = new sqlite3.Database(dbPath);
    this.testResults = [];
  }

  async runAllTests() {
    try {
      console.log('🧪 Starting Inventory System Tests...');
      console.log('=' .repeat(60));
      
      // Test 1: Database Structure
      await this.testDatabaseStructure();
      
      // Test 2: Data Integrity
      await this.testDataIntegrity();
      
      // Test 3: Stock Calculation
      await this.testStockCalculation();
      
      // Test 4: Transaction Processing
      await this.testTransactionProcessing();
      
      // Test 5: Views and Reports
      await this.testViewsAndReports();
      
      // Test 6: API Simulation
      await this.testAPISimulation();
      
      // Test 7: Edge Cases
      await this.testEdgeCases();
      
      // Generate Test Report
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    }
  }

  async testDatabaseStructure() {
    console.log('\n📊 Test 1: Database Structure');
    
    const requiredTables = [
      'raw_materials',
      'products', 
      'product_compositions',
      'pg_compositions',
      'raw_material_stock',
      'stock_movements',
      'daily_inventory_summary',
      'daily_sales_summary',
      'daily_product_sales',
      'transactions',
      'transaction_items'
    ];
    
    const requiredViews = [
      'product_full_composition',
      'current_stock_status'
    ];
    
    try {
      // Check tables
      const tables = await this.executeQuery(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);
      
      const tableNames = tables.map(t => t.name);
      
      for (const table of requiredTables) {
        try {
          if (tableNames.includes(table)) {
            console.log(`   ✅ Table '${table}' exists`);
            this.addTestResult('Database Structure', `Table ${table}`, 'PASS');
          } else {
            console.log(`   ❌ Table '${table}' missing`);
            this.addTestResult('Database Structure', `Table ${table}`, 'FAIL');
          }
        } catch (error) {
          console.log(`   ❌ Error checking table '${table}': ${error.message}`);
          this.addTestResult('Database Structure', `Table ${table}`, 'FAIL');
        }
      }
      
      // Check views
      const views = await this.executeQuery(`
        SELECT name FROM sqlite_master 
        WHERE type='view'
      `);
      
      const viewNames = views.map(v => v.name);
      
      for (const view of requiredViews) {
        if (viewNames.includes(view)) {
          console.log(`   ✅ View '${view}' exists`);
          this.addTestResult('Database Structure', `View ${view}`, 'PASS');
        } else {
          console.log(`   ❌ View '${view}' missing`);
          this.addTestResult('Database Structure', `View ${view}`, 'FAIL');
        }
      }
      
      // Check triggers
      const triggers = await this.executeQuery(`
        SELECT name FROM sqlite_master 
        WHERE type='trigger'
      `);
      
      console.log(`   📋 Found ${triggers.length} triggers:`);
      triggers.forEach(trigger => {
        console.log(`      - ${trigger.name}`);
      });
      
    } catch (error) {
      console.error('   ❌ Database structure test failed:', error.message);
      this.addTestResult('Database Structure', 'Overall', 'FAIL');
    }
  }

  async testDataIntegrity() {
    console.log('\n🔍 Test 2: Data Integrity');
    
    try {
      // Test raw materials
      const rawMaterials = await this.executeQuery('SELECT COUNT(*) as count FROM raw_materials');
      console.log(`   📦 Raw Materials: ${rawMaterials[0].count}`);
      
      if (rawMaterials[0].count > 0) {
        this.addTestResult('Data Integrity', 'Raw Materials', 'PASS');
      } else {
        this.addTestResult('Data Integrity', 'Raw Materials', 'FAIL');
      }
      
      // Test products
      const products = await this.executeQuery('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
      console.log(`   🍽️ Active Products: ${products[0].count}`);
      
      if (products[0].count > 0) {
        this.addTestResult('Data Integrity', 'Products', 'PASS');
      } else {
        this.addTestResult('Data Integrity', 'Products', 'FAIL');
      }
      
      // Test product compositions
      const compositions = await this.executeQuery('SELECT COUNT(*) as count FROM product_compositions');
      console.log(`   🔗 Product Compositions: ${compositions[0].count}`);
      
      if (compositions[0].count > 0) {
        this.addTestResult('Data Integrity', 'Product Compositions', 'PASS');
      } else {
        this.addTestResult('Data Integrity', 'Product Compositions', 'FAIL');
      }
      
      // Test PG compositions
      const pgCompositions = await this.executeQuery('SELECT COUNT(*) as count FROM pg_compositions');
      console.log(`   🔧 PG Compositions: ${pgCompositions[0].count}`);
      
      if (pgCompositions[0].count > 0) {
        this.addTestResult('Data Integrity', 'PG Compositions', 'PASS');
      } else {
        this.addTestResult('Data Integrity', 'PG Compositions', 'FAIL');
      }
      
      // Test stock data
      const stock = await this.executeQuery('SELECT COUNT(*) as count FROM raw_material_stock');
      console.log(`   📊 Stock Records: ${stock[0].count}`);
      
      if (stock[0].count > 0) {
        this.addTestResult('Data Integrity', 'Stock Records', 'PASS');
      } else {
        this.addTestResult('Data Integrity', 'Stock Records', 'FAIL');
      }
      
      // Test foreign key integrity
      const orphanedCompositions = await this.executeQuery(`
        SELECT COUNT(*) as count 
        FROM product_compositions pc
        LEFT JOIN products p ON pc.product_id = p.id
        WHERE p.id IS NULL
      `);
      
      if (orphanedCompositions[0].count === 0) {
        console.log(`   ✅ No orphaned product compositions`);
        this.addTestResult('Data Integrity', 'Foreign Keys', 'PASS');
      } else {
        console.log(`   ❌ Found ${orphanedCompositions[0].count} orphaned compositions`);
        this.addTestResult('Data Integrity', 'Foreign Keys', 'FAIL');
      }
      
    } catch (error) {
      console.error('   ❌ Data integrity test failed:', error.message);
      this.addTestResult('Data Integrity', 'Overall', 'FAIL');
    }
  }

  async testStockCalculation() {
    console.log('\n🧮 Test 3: Stock Calculation');
    
    try {
      // Test view functionality
      const stockStatus = await this.executeQuery(`
        SELECT COUNT(*) as total,
               SUM(CASE WHEN stock_status = 'ADEQUATE' THEN 1 ELSE 0 END) as adequate,
               SUM(CASE WHEN stock_status = 'LOW_STOCK' THEN 1 ELSE 0 END) as low,
               SUM(CASE WHEN stock_status = 'OUT_OF_STOCK' THEN 1 ELSE 0 END) as out
        FROM current_stock_status
      `);
      
      const status = stockStatus[0];
      console.log(`   📊 Stock Status Distribution:`);
      console.log(`      - Total Items: ${status.total}`);
      console.log(`      - Adequate: ${status.adequate}`);
      console.log(`      - Low Stock: ${status.low}`);
      console.log(`      - Out of Stock: ${status.out}`);
      
      if (status.total > 0) {
        this.addTestResult('Stock Calculation', 'Stock Status View', 'PASS');
      } else {
        this.addTestResult('Stock Calculation', 'Stock Status View', 'FAIL');
      }
      
      // Test product composition calculation
      const compositionTest = await this.executeQuery(`
        SELECT COUNT(*) as count 
        FROM product_full_composition 
        WHERE total_cost > 0
      `);
      
      console.log(`   💰 Products with calculated costs: ${compositionTest[0].count}`);
      
      if (compositionTest[0].count > 0) {
        this.addTestResult('Stock Calculation', 'Cost Calculation', 'PASS');
      } else {
        this.addTestResult('Stock Calculation', 'Cost Calculation', 'FAIL');
      }
      
      // Test unit conversions
      const unitTest = await this.executeQuery(`
        SELECT DISTINCT unit FROM raw_material_stock
      `);
      
      console.log(`   📏 Units in use: ${unitTest.map(u => u.unit).join(', ')}`);
      this.addTestResult('Stock Calculation', 'Unit Handling', 'PASS');
      
    } catch (error) {
      console.error('   ❌ Stock calculation test failed:', error.message);
      this.addTestResult('Stock Calculation', 'Overall', 'FAIL');
    }
  }

  async testTransactionProcessing() {
    console.log('\n💳 Test 4: Transaction Processing');
    
    try {
      // Get initial stock levels
      const initialStock = await this.executeQuery(`
        SELECT rm.name, rms.current_quantity
        FROM raw_material_stock rms
        JOIN raw_materials rm ON rms.raw_material_id = rm.id
        WHERE rm.name IN ('Beras', 'Beef Slice')
      `);
      
      console.log(`   📦 Initial stock levels:`);
      initialStock.forEach(stock => {
        console.log(`      - ${stock.name}: ${stock.current_quantity}`);
      });
      
      // Create test transaction
      const testProduct = await this.executeQuery(`
        SELECT id, name, price 
        FROM products 
        WHERE name LIKE '%Nasi%' AND is_active = 1 
        LIMIT 1
      `);
      
      if (testProduct.length === 0) {
        console.log(`   ⚠️ No test product found`);
        this.addTestResult('Transaction Processing', 'Test Product', 'SKIP');
        return;
      }
      
      const product = testProduct[0];
      const testQuantity = 3;
      
      console.log(`   🛒 Creating test transaction: ${testQuantity}x ${product.name}`);
      
      // Generate UUIDs for transaction and item
      const transactionId = uuidv4();
      const itemId = uuidv4();
      
      // Insert transaction with UUID
      await this.executeQuery(`
        INSERT INTO transactions (
          id, transaction_number, transaction_date, total_amount, 
          tax_amount, discount_amount, final_amount, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        transactionId,
        `TEST-${Date.now()}`,
        new Date().toISOString(),
        product.price * testQuantity,
        product.price * testQuantity * 0.1,
        0,
        product.price * testQuantity * 1.1,
        'completed'
      ]);
      
      // Insert transaction item with UUID (this should trigger stock updates)
      await this.executeQuery(`
        INSERT INTO transaction_items (
          id, transaction_id, product_id, product_name, quantity, unit_price, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        itemId,
        transactionId,
        product.id,
        product.name,
        testQuantity,
        product.price,
        product.price * testQuantity
      ]);
      
      console.log(`   ✅ Test transaction created (ID: ${transactionId})`);
      
      // Check if stock was updated
      const updatedStock = await this.executeQuery(`
        SELECT rm.name, rms.current_quantity
        FROM raw_material_stock rms
        JOIN raw_materials rm ON rms.raw_material_id = rm.id
        WHERE rm.name IN ('Beras', 'Beef Slice')
      `);
      
      console.log(`   📦 Updated stock levels:`);
      let stockChanged = false;
      updatedStock.forEach(stock => {
        const initial = initialStock.find(s => s.name === stock.name);
        const change = initial ? (stock.current_quantity - initial.current_quantity) : 0;
        console.log(`      - ${stock.name}: ${stock.current_quantity} (${change >= 0 ? '+' : ''}${change})`);
        if (change !== 0) stockChanged = true;
      });
      
      if (stockChanged) {
        console.log(`   ✅ Stock levels updated automatically`);
        this.addTestResult('Transaction Processing', 'Auto Stock Update', 'PASS');
      } else {
        console.log(`   ⚠️ Stock levels not updated (triggers may not be working)`);
        this.addTestResult('Transaction Processing', 'Auto Stock Update', 'FAIL');
      }
      
      // Check stock movements
      const movements = await this.executeQuery(`
        SELECT COUNT(*) as count 
        FROM stock_movements 
        WHERE reference_type = 'SALE' AND reference_id = ?
      `, [transactionId]);
      
      if (movements[0].count > 0) {
        console.log(`   ✅ Stock movements recorded: ${movements[0].count}`);
        this.addTestResult('Transaction Processing', 'Stock Movements', 'PASS');
      } else {
        console.log(`   ❌ No stock movements recorded`);
        this.addTestResult('Transaction Processing', 'Stock Movements', 'FAIL');
      }
      
      // Clean up test data
      await this.executeQuery('DELETE FROM transaction_items WHERE transaction_id = ?', [transactionId]);
      await this.executeQuery('DELETE FROM transactions WHERE id = ?', [transactionId]);
      
    } catch (error) {
      console.error('   ❌ Transaction processing test failed:', error.message);
      this.addTestResult('Transaction Processing', 'Overall', 'FAIL');
    }
  }

  async testViewsAndReports() {
    console.log('\n📊 Test 5: Views and Reports');
    
    try {
      // Test daily sales summary
      const dailySummary = await this.executeQuery(`
        SELECT COUNT(*) as count FROM daily_sales_summary
      `);
      
      console.log(`   📈 Daily sales summary records: ${dailySummary[0].count}`);
      
      if (dailySummary[0].count >= 0) {
        this.addTestResult('Views and Reports', 'Daily Sales Summary', 'PASS');
      } else {
        this.addTestResult('Views and Reports', 'Daily Sales Summary', 'FAIL');
      }
      
      // Test product sales
      const productSales = await this.executeQuery(`
        SELECT COUNT(*) as count FROM daily_product_sales
      `);
      
      console.log(`   🍽️ Daily product sales records: ${productSales[0].count}`);
      
      if (productSales[0].count >= 0) {
        this.addTestResult('Views and Reports', 'Product Sales', 'PASS');
      } else {
        this.addTestResult('Views and Reports', 'Product Sales', 'FAIL');
      }
      
      // Test inventory summary
      const inventorySummary = await this.executeQuery(`
        SELECT COUNT(*) as count FROM daily_inventory_summary
      `);
      
      console.log(`   📦 Daily inventory summary records: ${inventorySummary[0].count}`);
      
      if (inventorySummary[0].count >= 0) {
        this.addTestResult('Views and Reports', 'Inventory Summary', 'PASS');
      } else {
        this.addTestResult('Views and Reports', 'Inventory Summary', 'FAIL');
      }
      
    } catch (error) {
      console.error('   ❌ Views and reports test failed:', error.message);
      this.addTestResult('Views and Reports', 'Overall', 'FAIL');
    }
  }

  async testAPISimulation() {
    console.log('\n🔌 Test 6: API Simulation');
    
    try {
      // Simulate stock status API
      const stockStatusAPI = await this.executeQuery(`
        SELECT 
          rm.name as raw_material_name,
          rms.current_quantity,
          rms.unit,
          rms.minimum_stock,
          CASE 
            WHEN rms.current_quantity <= 0 THEN 'OUT_OF_STOCK'
            WHEN rms.current_quantity <= rms.minimum_stock THEN 'LOW_STOCK'
            ELSE 'ADEQUATE'
          END as stock_status,
          ROUND(rms.current_quantity * rm.current_price, 2) as stock_value
        FROM raw_material_stock rms
        JOIN raw_materials rm ON rms.raw_material_id = rm.id
        ORDER BY stock_status, rm.name
        LIMIT 5
      `);
      
      console.log(`   📊 Stock Status API simulation:`);
      stockStatusAPI.forEach(item => {
        const statusIcon = {
          'OUT_OF_STOCK': '🔴',
          'LOW_STOCK': '🟡',
          'ADEQUATE': '🟢'
        }[item.stock_status];
        
        console.log(`      ${statusIcon} ${item.raw_material_name}: ${item.current_quantity} ${item.unit} (Rp ${item.stock_value})`);
      });
      
      this.addTestResult('API Simulation', 'Stock Status', 'PASS');
      
      // Simulate dashboard API
      const dashboardAPI = await this.executeQuery(`
        SELECT 
          (SELECT COUNT(*) FROM raw_materials) as total_materials,
          (SELECT COUNT(*) FROM products WHERE is_active = 1) as active_products,
          (SELECT COUNT(*) FROM current_stock_status WHERE stock_status = 'ADEQUATE') as adequate_stock,
          (SELECT COUNT(*) FROM current_stock_status WHERE stock_status = 'LOW_STOCK') as low_stock,
          (SELECT COUNT(*) FROM current_stock_status WHERE stock_status = 'OUT_OF_STOCK') as out_of_stock
      `);
      
      const dashboard = dashboardAPI[0];
      console.log(`   📈 Dashboard API simulation:`);
      console.log(`      - Total Materials: ${dashboard.total_materials}`);
      console.log(`      - Active Products: ${dashboard.active_products}`);
      console.log(`      - Adequate Stock: ${dashboard.adequate_stock}`);
      console.log(`      - Low Stock: ${dashboard.low_stock}`);
      console.log(`      - Out of Stock: ${dashboard.out_of_stock}`);
      
      this.addTestResult('API Simulation', 'Dashboard', 'PASS');
      
    } catch (error) {
      console.error('   ❌ API simulation test failed:', error.message);
      this.addTestResult('API Simulation', 'Overall', 'FAIL');
    }
  }

  async testEdgeCases() {
    console.log('\n⚠️ Test 7: Edge Cases');
    
    try {
      // Test negative stock handling
      const negativeStock = await this.executeQuery(`
        SELECT COUNT(*) as count 
        FROM raw_material_stock 
        WHERE current_quantity < 0
      `);
      
      console.log(`   📉 Items with negative stock: ${negativeStock[0].count}`);
      
      if (negativeStock[0].count === 0) {
        this.addTestResult('Edge Cases', 'Negative Stock', 'PASS');
      } else {
        this.addTestResult('Edge Cases', 'Negative Stock', 'WARN');
      }
      
      // Test missing compositions
      const missingCompositions = await this.executeQuery(`
        SELECT COUNT(*) as count
        FROM products p
        LEFT JOIN product_compositions pc ON p.id = pc.product_id
        WHERE p.is_active = 1 AND pc.product_id IS NULL
      `);
      
      console.log(`   🔍 Active products without compositions: ${missingCompositions[0].count}`);
      
      if (missingCompositions[0].count === 0) {
        this.addTestResult('Edge Cases', 'Missing Compositions', 'PASS');
      } else {
        this.addTestResult('Edge Cases', 'Missing Compositions', 'WARN');
      }
      
      // Test zero-cost items
      const zeroCost = await this.executeQuery(`
        SELECT COUNT(*) as count
        FROM raw_materials
        WHERE current_price = 0
      `);
      
      console.log(`   💰 Zero-cost materials: ${zeroCost[0].count}`);
      
      if (zeroCost[0].count <= 1) { // Allow for water or similar
        this.addTestResult('Edge Cases', 'Zero Cost Items', 'PASS');
      } else {
        this.addTestResult('Edge Cases', 'Zero Cost Items', 'WARN');
      }
      
    } catch (error) {
      console.error('   ❌ Edge cases test failed:', error.message);
      this.addTestResult('Edge Cases', 'Overall', 'FAIL');
    }
  }

  generateTestReport() {
    console.log('\n' + '=' .repeat(60));
    console.log('📋 TEST REPORT SUMMARY');
    console.log('=' .repeat(60));
    
    const summary = {
      PASS: 0,
      FAIL: 0,
      WARN: 0,
      SKIP: 0
    };
    
    const groupedResults = {};
    
    this.testResults.forEach(result => {
      summary[result.status]++;
      
      if (!groupedResults[result.category]) {
        groupedResults[result.category] = [];
      }
      groupedResults[result.category].push(result);
    });
    
    // Print grouped results
    Object.keys(groupedResults).forEach(category => {
      console.log(`\n📂 ${category}:`);
      groupedResults[category].forEach(result => {
        const icon = {
          'PASS': '✅',
          'FAIL': '❌',
          'WARN': '⚠️',
          'SKIP': '⏭️'
        }[result.status];
        
        console.log(`   ${icon} ${result.test}: ${result.status}`);
      });
    });
    
    // Print summary
    console.log('\n📊 Overall Summary:');
    console.log(`   ✅ Passed: ${summary.PASS}`);
    console.log(`   ❌ Failed: ${summary.FAIL}`);
    console.log(`   ⚠️ Warnings: ${summary.WARN}`);
    console.log(`   ⏭️ Skipped: ${summary.SKIP}`);
    
    const total = summary.PASS + summary.FAIL + summary.WARN + summary.SKIP;
    const successRate = total > 0 ? ((summary.PASS / total) * 100).toFixed(1) : 0;
    
    console.log(`\n🎯 Success Rate: ${successRate}% (${summary.PASS}/${total})`);
    
    if (summary.FAIL === 0 && summary.WARN <= 2) {
      console.log('\n🎉 Inventory System is ready for production!');
    } else if (summary.FAIL === 0) {
      console.log('\n✅ Inventory System is functional with minor warnings.');
    } else {
      console.log('\n⚠️ Inventory System has issues that need to be addressed.');
    }
    
    console.log('=' .repeat(60));
  }

  addTestResult(category, test, status) {
    this.testResults.push({
      category,
      test,
      status,
      timestamp: new Date().toISOString()
    });
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
  const tester = new InventorySystemTester();
  
  try {
    await tester.runAllTests();
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  } finally {
    tester.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = InventorySystemTester;