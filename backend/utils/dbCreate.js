require('dotenv').config();
const { sequelize } = require('../config/database');
const { 
  Role, 
  User, 
  Category, 
  PaymentMethod,
  Product,
  Inventory,
  TaxSetting,
  Discount,
  RoundingSetting,
  Customer,
  LoyaltyProgram,
  CafeOperationLog,
  CustomerSegment,
  MarketingCampaign,
  CustomerCommunication,
  CustomerFeedback,
  Lead
} = require('../models');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const createDatabase = async () => {
  try {
    // Sync all models with database (this will create tables)
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');
    
    // Create roles
    const roles = await Role.bulkCreate([
      {
        name: 'admin',
        description: 'Administrator dengan akses penuh',
        permissions: {
          users: { view: true, create: true, update: true, delete: true },
          products: { view: true, create: true, update: true, delete: true },
          inventory: { view: true, create: true, update: true, delete: true },
          transactions: { view: true, create: true, update: true, delete: true, cancel: true },
          reports: { view: true, export: true },
          employees: { view: true, create: true, update: true, delete: true },
          payroll: { view: true, create: true, update: true },
          settings: { view: true, update: true }
        }
      },
      {
        name: 'manager',
        description: 'Manajer dengan akses ke semua fitur kecuali pengaturan sistem',
        permissions: {
          users: { view: true, create: true, update: true, delete: false },
          products: { view: true, create: true, update: true, delete: true },
          inventory: { view: true, create: true, update: true, delete: false },
          transactions: { view: true, create: true, update: true, delete: false, cancel: true },
          reports: { view: true, export: true },
          employees: { view: true, create: true, update: true, delete: false },
          payroll: { view: true, create: true, update: true },
          settings: { view: true, update: false }
        }
      },
      {
        name: 'kasir',
        description: 'Kasir dengan akses ke fitur point of sales',
        permissions: {
          users: { view: false, create: false, update: false, delete: false },
          products: { view: true, create: false, update: false, delete: false },
          inventory: { view: true, create: false, update: false, delete: false },
          transactions: { view: true, create: true, update: true, delete: false, cancel: false },
          reports: { view: false, export: false },
          employees: { view: false, create: false, update: false, delete: false },
          payroll: { view: false, create: false, update: false },
          settings: { view: false, update: false }
        }
      }
    ]);
    console.log('Roles created successfully.');
    
    // Hash password for admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@sajati.com',
      full_name: 'Administrator',
      role_id: 1, // Admin role
      is_active: true
    });
    console.log('Admin user created successfully.');
    
    // Create manager user
    const managerUser = await User.create({
      username: 'manager',
      password: hashedPassword,
      email: 'manager@sajati.com',
      full_name: 'Manager Cafe',
      role_id: 2, // Manager role
      is_active: true
    });
    console.log('Manager user created successfully.');
    
    // Create cashier user
    const cashierUser = await User.create({
      username: 'kasir',
      password: hashedPassword,
      email: 'kasir@sajati.com',
      full_name: 'Kasir Cafe',
      role_id: 3, // Cashier role
      is_active: true
    });
    console.log('Cashier user created successfully.');
    
    // Create categories
    const categories = await Category.bulkCreate([
      {
        name: 'Minuman',
        description: 'Kopi dan minuman lainnya',
        icon: 'hgi-stroke hgi-coffee'
      },
      {
        name: 'Makanan',
        description: 'Sajati dan makanan lainnya',
        icon: 'hgi-stroke hgi-fork-knife'
      },
      {
        name: 'Snack',
        description: 'Camilan dan kue',
        icon: 'hgi-stroke hgi-bakery'
      }
    ]);
    console.log('Categories created successfully.');
    
    // Create payment methods
    const paymentMethods = await PaymentMethod.bulkCreate([
      {
        name: 'Cash',
        code: 'CASH',
        description: 'Pembayaran tunai',
        is_active: true,
        icon: 'hgi-stroke hgi-cash-01'
      },
      {
        name: 'QRIS',
        code: 'QRIS',
        description: 'Pembayaran dengan QRIS',
        is_active: true,
        icon: 'hgi-stroke hgi-qr-code'
      },
      {
        name: 'Card',
        code: 'CARD',
        description: 'Pembayaran dengan kartu debit/kredit',
        is_active: true,
        icon: 'hgi-stroke hgi-credit-card'
      },
      {
        name: 'E-Wallet',
        code: 'EWALLET',
        description: 'Pembayaran dengan e-wallet (OVO, GoPay, dll)',
        is_active: true,
        icon: 'hgi-stroke hgi-wallet-01'
      }
    ]);
    console.log('Payment methods created successfully.');
    
    // Create some products
    const products = [
      {
        id: uuidv4(),
        name: 'Kopi Americano',
        description: 'Kopi hitam dengan tambahan air panas',
        price: 15000,
        category_id: 1,
        image_url: 'https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1653411712105-31fdd4e39c40',
        sku: 'KOP001',
        is_active: true
      },
      {
        id: uuidv4(),
        name: 'Sajati Original',
        description: 'Sajati dengan taburan gula',
        price: 12000,
        category_id: 2,
        image_url: 'https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1721027322774-b1479ea07627',
        sku: 'PCG001',
        is_active: true
      },
      {
        id: uuidv4(),
        name: 'Latte',
        description: 'Espresso dengan steamed milk',
        price: 18000,
        category_id: 1,
        image_url: 'https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1549045108-1817700573a3',
        sku: 'KOP002',
        is_active: true
      },
      {
        id: uuidv4(),
        name: 'Cappuccino',
        description: 'Espresso dengan steamed milk dan foam',
        price: 17000,
        category_id: 1,
        image_url: 'https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1640244444369-ca21d61d7a05',
        sku: 'KOP003',
        is_active: true
      },
      {
        id: uuidv4(),
        name: 'Sajati Keju',
        description: 'Sajati dengan taburan keju',
        price: 15000,
        category_id: 2,
        image_url: 'https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1713700321951-d79e5c39ea93',
        sku: 'PCG002',
        is_active: true
      },
      {
        id: uuidv4(),
        name: 'Green Tea Latte',
        description: 'Green tea dengan steamed milk',
        price: 20000,
        category_id: 1,
        image_url: 'https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1739224054384-ec1343840e67',
        sku: 'KOP004',
        is_active: true
      },
      {
        id: uuidv4(),
        name: 'Sajati Coklat',
        description: 'Sajati dengan taburan coklat',
        price: 14000,
        category_id: 2,
        image_url: 'https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1498604132755-751b73a22ec9',
        sku: 'PCG003',
        is_active: true
      },
      {
        id: uuidv4(),
        name: 'Espresso',
        description: 'Kopi hitam murni',
        price: 13000,
        category_id: 1,
        image_url: 'https://public.youware.com/users-website-assets/prod/63f75314-f75c-43cc-ae5d-0421aa05ea62/photo-1641816481191-d4522e79ba38',
        sku: 'KOP005',
        is_active: true
      }
    ];
    
    // Create the products
    for (const product of products) {
      const createdProduct = await Product.create(product);
      
      // Create inventory for the product
      await Inventory.create({
        product_id: createdProduct.id,
        quantity: 100,
        min_quantity: 10,
        unit: 'pcs',
        last_updated_by: adminUser.id
      });
    }
    
    console.log('Products and inventory created successfully.');
    
    // Create tax settings
    const taxSettings = await TaxSetting.bulkCreate([
      {
        setting_key: 'ppn',
        setting_name: 'PPN (Pajak Pertambahan Nilai)',
        percentage: 11.00,
        is_active: true,
        description: 'Pajak Pertambahan Nilai sesuai regulasi pemerintah Indonesia',
        apply_before_service: false,
        updated_by: adminUser.id
      },
      {
        setting_key: 'service_charge',
        setting_name: 'Service Charge',
        percentage: 5.00,
        is_active: true,
        description: 'Biaya pelayanan restaurant',
        apply_before_service: true,
        updated_by: adminUser.id
      }
    ]);
    console.log('Tax settings created successfully.');
    
    // Create sample discounts
    const discounts = await Discount.bulkCreate([
      {
        code: 'WELCOME10',
        name: 'Diskon Selamat Datang',
        description: 'Diskon 10% untuk customer baru',
        type: 'percentage',
        value: 10.00,
        max_discount_amount: 25000,
        minimum_purchase: 50000,
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        usage_limit: 100,
        applicable_to: 'all',
        applicable_items: [],
        is_active: true,
        created_by: adminUser.id,
        updated_by: adminUser.id
      },
      {
        code: 'COFFEE50K',
        name: 'Potongan Kopi 50ribu',
        description: 'Potongan langsung Rp 5.000 untuk pembelian kopi',
        type: 'fixed_amount',
        value: 5000,
        minimum_purchase: 0,
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        applicable_to: 'category',
        applicable_items: [1], // Minuman category
        is_active: true,
        created_by: adminUser.id,
        updated_by: adminUser.id
      },
      {
        code: 'BUY2GET1',
        name: 'Beli 2 Gratis 1',
        description: 'Beli 2 sajati gratis 1 sajati',
        type: 'buy_x_get_y',
        value: 0,
        buy_quantity: 2,
        get_quantity: 1,
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        applicable_to: 'category',
        applicable_items: [2], // Makanan category
        is_active: true,
        created_by: adminUser.id,
        updated_by: adminUser.id
      }
    ]);
    console.log('Sample discounts created successfully.');
    
    // Create rounding settings
    const roundingSetting = await RoundingSetting.create({
      is_active: true,
      rounding_method: 'nearest',
      rounding_increment: 100,
      apply_to: 'final_total',
      description: 'Pembulatan ke Rp 100 terdekat',
      updated_by: adminUser.id
    });
    console.log('Rounding settings created successfully.');
    
    // Create loyalty program
    const loyaltyProgram = await LoyaltyProgram.create({
      name: 'Sajati Smart System Loyalty Program',
      description: 'Program loyalty untuk customer setia Sajati Smart System',
      earn_rate: 1.0,
      tier_bronze_min: 0,
      tier_silver_min: 500000,
      tier_gold_min: 1500000,
      tier_platinum_min: 5000000,
      bronze_multiplier: 1.0,
      silver_multiplier: 1.25,
      gold_multiplier: 1.5,
      platinum_multiplier: 2.0,
      redemption_rate: 1000,
      min_redemption_points: 100,
      max_redemption_percent: 50,
      points_expiry_days: 365,
      birthday_bonus_points: 100,
      referral_points: 50,
      is_active: true,
      updated_by: adminUser.id
    });
    console.log('Loyalty program created successfully.');
    
    // Create sample customers
    const customers = await Customer.bulkCreate([
      {
        customer_code: 'CUS001',
        name: 'Budi Santoso',
        phone: '081234567890',
        email: 'budi.santoso@email.com',
        birth_date: '1985-05-15',
        gender: 'male',
        loyalty_points: 2500,
        loyalty_tier: 'gold',
        total_spent: 1850000,
        visit_count: 25,
        last_visit: new Date(),
        is_active: true,
        created_by: adminUser.id,
        updated_by: adminUser.id
      },
      {
        customer_code: 'CUS002',
        name: 'Siti Rahayu',
        phone: '081234567891',
        email: 'siti.rahayu@email.com',
        birth_date: '1990-08-22',
        gender: 'female',
        loyalty_points: 1200,
        loyalty_tier: 'silver',
        total_spent: 750000,
        visit_count: 15,
        last_visit: new Date(),
        is_active: true,
        created_by: adminUser.id,
        updated_by: adminUser.id
      },
      {
        customer_code: 'CUS003',
        name: 'Ahmad Fauzi',
        phone: '081234567892',
        email: 'ahmad.fauzi@email.com',
        birth_date: '1988-12-10',
        gender: 'male',
        loyalty_points: 350,
        loyalty_tier: 'bronze',
        total_spent: 285000,
        visit_count: 8,
        last_visit: new Date(),
        is_active: true,
        created_by: adminUser.id,
        updated_by: adminUser.id
      },
      {
        customer_code: 'CUS004',
        name: 'Dewi Sartika',
        phone: '081234567893',
        email: 'dewi.sartika@email.com',
        birth_date: '1987-03-18',
        gender: 'female',
        loyalty_points: 5000,
        loyalty_tier: 'platinum',
        total_spent: 5500000,
        visit_count: 45,
        last_visit: new Date(),
        is_active: true,
        created_by: adminUser.id,
        updated_by: adminUser.id
      }
    ]);
    console.log('Sample customers created successfully.');
    
    // Create initial cafe operation log (open cafe)
    const cafeOperation = await CafeOperationLog.create({
      operation_date: new Date().toISOString().split('T')[0],
      operation_type: 'open',
      user_id: adminUser.id,
      opening_cash: 500000,
      notes: 'Pembukaan cafe hari ini',
      pos_terminal: 'POS-01'
    });
    console.log('Initial cafe operation log created successfully.');
    
    // Create customer segments
    const segments = await CustomerSegment.bulkCreate([
      {
        name: 'VIP Platinum Customers',
        description: 'Customer tier platinum dengan total belanja tinggi',
        criteria: {
          tier: ['platinum'],
          totalSpentMin: 3000000
        },
        target_count: 8,
        color: '#e5e4e2',
        created_by: adminUser.id,
        updated_by: adminUser.id
      },
      {
        name: 'Regular Gold Members',
        description: 'Customer gold yang aktif berbelanja',
        criteria: {
          tier: ['gold'],
          visitCountMin: 15
        },
        target_count: 25,
        color: '#ffd700',
        created_by: adminUser.id,
        updated_by: adminUser.id
      },
      {
        name: 'New Customers',
        description: 'Customer baru dalam 30 hari terakhir',
        criteria: {
          tier: ['bronze'],
          lastVisitDays: 30
        },
        target_count: 45,
        color: '#cd7f32',
        created_by: adminUser.id,
        updated_by: adminUser.id
      }
    ]);
    console.log('Customer segments created successfully.');
    
    // Create sample marketing campaigns
    const campaigns = await MarketingCampaign.bulkCreate([
      {
        name: 'Weekend Special Promo',
        description: 'Promo khusus weekend untuk semua customer',
        type: 'whatsapp',
        status: 'running',
        target_segments: [segments[1].id, segments[2].id],
        message_template: 'Halo {name}! Dapatkan diskon 20% untuk pembelian weekend ini di Sajati Smart System. Berlaku Sabtu-Minggu.',
        start_date: new Date(),
        end_date: moment().add(7, 'days').toDate(),
        sent_count: 85,
        delivered_count: 82,
        opened_count: 45,
        clicked_count: 12,
        budget: 500000,
        spent: 125000,
        created_by: adminUser.id,
        updated_by: adminUser.id
      },
      {
        name: 'VIP Birthday Campaign',
        description: 'Kampanye ulang tahun untuk customer VIP',
        type: 'email',
        status: 'scheduled',
        target_segments: [segments[0].id],
        message_template: 'Selamat ulang tahun {name}! Nikmati menu special dengan diskon 30% sebagai hadiah dari Sajati Smart System.',
        subject: 'Happy Birthday from Sajati Smart System!',
        start_date: moment().add(1, 'day').toDate(),
        budget: 200000,
        created_by: adminUser.id,
        updated_by: adminUser.id
      }
    ]);
    console.log('Sample marketing campaigns created successfully.');
    
    // Create sample customer communications
    const communications = await CustomerCommunication.bulkCreate([
      {
        customer_id: customers[0].id,
        type: 'whatsapp',
        direction: 'outbound',
        subject: 'Follow up pesanan special',
        message: 'Halo Pak Budi, terima kasih sudah memesan menu special kemarin. Bagaimana rasanya? Ada feedback untuk kami?',
        status: 'sent',
        sent_at: moment().subtract(2, 'days').toDate(),
        priority: 'medium',
        tags: ['follow_up', 'feedback_request'],
        created_by: adminUser.id
      },
      {
        customer_id: customers[1].id,
        type: 'phone_call',
        direction: 'inbound',
        message: 'Customer menanyakan ketersediaan menu sajati untuk acara ulang tahun (50 porsi). Sudah dijadwalkan untuk minggu depan.',
        status: 'delivered',
        priority: 'high',
        follow_up_required: true,
        follow_up_date: moment().add(2, 'days').toDate(),
        tags: ['catering', 'event'],
        created_by: adminUser.id
      }
    ]);
    console.log('Sample customer communications created successfully.');
    
    // Create sample customer feedback
    const feedbacks = await CustomerFeedback.bulkCreate([
      {
        customer_id: customers[0].id,
        type: 'review',
        rating: 5,
        title: 'Pelayanan Sangat Memuaskan',
        message: 'Sajati nya enak banget, pelayanan ramah, suasana nyaman. Pasti akan datang lagi bersama keluarga.',
        category: 'general',
        status: 'new',
        priority: 'low',
        is_public: true,
        is_featured: true,
        source: 'in_app',
        tags: ['positive', 'family_friendly']
      },
      {
        customer_id: customers[1].id,
        type: 'complaint',
        rating: 3,
        title: 'Antrian Agak Lama',
        message: 'Makanan enak tapi antrian cukup lama, mungkin perlu tambahan kasir saat jam sibuk.',
        category: 'service',
        status: 'acknowledged',
        priority: 'medium',
        is_public: true,
        source: 'in_app',
        tags: ['service_improvement', 'queue_time'],
        response: 'Terima kasih feedbacknya Bu Siti. Kami akan menambah kasir pada jam sibuk.',
        response_by: adminUser.id,
        response_at: new Date()
      }
    ]);
    console.log('Sample customer feedback created successfully.');
    
    // Create sample leads
    const leads = await Lead.bulkCreate([
      {
        name: 'PT. Maju Bersama',
        phone: '081234567894',
        email: 'procurement@majubersama.com',
        company: 'PT. Maju Bersama',
        source: 'referral',
        status: 'qualified',
        interest_level: 'hot',
        estimated_value: 5000000,
        probability: 80,
        expected_close_date: moment().add(10, 'days').toDate(),
        notes: 'Membutuhkan catering sajati untuk 5 acara wedding dalam 2 bulan',
        last_contact_date: moment().subtract(1, 'day').toDate(),
        next_follow_up: moment().add(2, 'days').toDate(),
        assigned_to: adminUser.id,
        referrer_customer_id: customers[0].id,
        tags: ['corporate', 'catering', 'monthly_order'],
        created_by: adminUser.id,
        updated_by: adminUser.id
      },
      {
        name: 'Sarah Wedding Organizer',
        phone: '081234567895',
        email: 'sarah@weddingorganizer.com',
        company: 'Sarah Wedding Organizer',
        source: 'social_media',
        status: 'contacted',
        interest_level: 'warm',
        estimated_value: 15000000,
        probability: 60,
        expected_close_date: moment().add(30, 'days').toDate(),
        notes: 'Membutuhkan catering sajati untuk 5 acara wedding dalam 2 bulan',
        last_contact_date: moment().subtract(3, 'days').toDate(),
        next_follow_up: moment().add(1, 'day').toDate(),
        assigned_to: adminUser.id,
        tags: ['wedding', 'catering', 'bulk_order'],
        created_by: adminUser.id,
        updated_by: adminUser.id
      }
    ]);
    console.log('Sample leads created successfully.');
    
    console.log('Database initialization completed successfully.');
    
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    process.exit();
  }
};

createDatabase();