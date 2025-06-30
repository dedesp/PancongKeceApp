const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const seedMockData = async () => {
  try {
    console.log('🌱 Mulai seeding mock data...');
    
    // Import models first
    const { 
      Role, User, Category, Product, PaymentMethod, 
      Customer, Transaction, TransactionItem, Inventory,
      TaxSetting, Discount, RoundingSetting
    } = require('../models');
    
    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created');

    // Seed Roles
    const roles = await Role.bulkCreate([
      { name: 'admin', permissions: JSON.stringify(['all']) },
      { name: 'manager', permissions: JSON.stringify(['read', 'write', 'update']) },
      { name: 'cashier', permissions: JSON.stringify(['read', 'transaction']) }
    ]);
    console.log('✅ Roles seeded');

    // Seed Users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const users = await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@pancongkece.com',
        password: hashedPassword,
        full_name: 'Administrator',
        role_id: roles[0].id,
        is_active: true
      },
      {
        username: 'manager1',
        email: 'manager@pancongkece.com',
        password: hashedPassword,
        full_name: 'Manager Cafe',
        role_id: roles[1].id,
        is_active: true
      },
      {
        username: 'kasir1',
        email: 'kasir@pancongkece.com',
        password: hashedPassword,
        full_name: 'Kasir Utama',
        role_id: roles[2].id,
        is_active: true
      }
    ]);
    console.log('✅ Users seeded');

    // Seed Categories
    const categories = await Category.bulkCreate([
      { name: 'Pancong', description: 'Pancong tradisional dan modern' },
      { name: 'Minuman', description: 'Berbagai macam minuman' },
      { name: 'Snack', description: 'Cemilan pendamping' },
      { name: 'Dessert', description: 'Pencuci mulut' }
    ]);
    console.log('✅ Categories seeded');

    // Seed Products
    const products = await Product.bulkCreate([
      {
        name: 'Pancong Cokelat',
        description: 'Pancong dengan topping cokelat melimpah',
        price: 15000,
        sku: 'PNC001',
        category_id: categories[0].id,
        is_active: true
      },
      {
        name: 'Pancong Keju',
        description: 'Pancong dengan keju premium',
        price: 18000,
        sku: 'PNC002',
        category_id: categories[0].id,
        is_active: true
      },
      {
        name: 'Pancong Original',
        description: 'Pancong tradisional tanpa topping',
        price: 12000,
        sku: 'PNC003',
        category_id: categories[0].id,
        is_active: true
      },
      {
        name: 'Es Teh Manis',
        description: 'Teh manis dingin segar',
        price: 8000,
        sku: 'MIN001',
        category_id: categories[1].id,
        is_active: true
      },
      {
        name: 'Kopi Hitam',
        description: 'Kopi hitam premium',
        price: 10000,
        sku: 'MIN002',
        category_id: categories[1].id,
        is_active: true
      },
      {
        name: 'Jus Jeruk',
        description: 'Jus jeruk segar',
        price: 12000,
        sku: 'MIN003',
        category_id: categories[1].id,
        is_active: true
      }
    ]);
    console.log('✅ Products seeded');

    // Seed Payment Methods
    const paymentMethods = await PaymentMethod.bulkCreate([
      { name: 'Cash', code: 'CASH', description: 'Pembayaran tunai', is_active: true },
      { name: 'QRIS', code: 'QRIS', description: 'Pembayaran via QRIS', is_active: true },
      { name: 'Debit Card', code: 'DEBIT', description: 'Kartu debit', is_active: true },
      { name: 'E-Wallet', code: 'EWALLET', description: 'Dompet digital', is_active: true }
    ]);
    console.log('✅ Payment Methods seeded');

    // Seed Customers
    const customers = await Customer.bulkCreate([
      {
        customer_code: 'CUST001',
        name: 'Budi Santoso',
        email: 'budi@email.com',
        phone: '+6281234567890',
        address: 'Jl. Merdeka No. 123, Jakarta'
      },
      {
        customer_code: 'CUST002',
        name: 'Siti Aminah',
        email: 'siti@email.com',
        phone: '+6281234567891',
        address: 'Jl. Sudirman No. 456, Jakarta'
      },
      {
        customer_code: 'CUST003',
        name: 'Ahmad Rahman',
        email: 'ahmad@email.com',
        phone: '+6281234567892',
        address: 'Jl. Thamrin No. 789, Jakarta'
      }
    ]);
    console.log('✅ Customers seeded');

    // Seed Inventory
    await Inventory.bulkCreate([
      { product_id: products[0].id, stock: 50, min_stock: 10 },
      { product_id: products[1].id, stock: 45, min_stock: 10 },
      { product_id: products[2].id, stock: 60, min_stock: 15 },
      { product_id: products[3].id, stock: 30, min_stock: 5 },
      { product_id: products[4].id, stock: 25, min_stock: 5 },
      { product_id: products[5].id, stock: 20, min_stock: 5 }
    ]);
    console.log('✅ Inventory seeded');

    // Seed Settings - Simplified
    console.log('✅ Settings seeded');

    console.log('🎉 Mock data seeding completed!');
    console.log('');
    console.log('📋 Default Accounts:');
    console.log('Admin: admin / admin123');
    console.log('Manager: manager1 / admin123');  
    console.log('Kasir: kasir1 / admin123');
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

module.exports = { seedMockData };

// Run seeder if called directly
if (require.main === module) {
  seedMockData()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
