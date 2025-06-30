const { Customer, User, Transaction, PointTransaction, LoyaltyProgram, sequelize } = require('../models');
const moment = require('moment');

// Generate customer code
function generateCustomerCode() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CUS${timestamp}${random}`;
}

// Calculate loyalty tier based on total spent
function calculateLoyaltyTier(totalSpent, loyaltyProgram) {
  if (!loyaltyProgram) return 'bronze';
  
  if (totalSpent >= loyaltyProgram.tier_platinum_min) return 'platinum';
  if (totalSpent >= loyaltyProgram.tier_gold_min) return 'gold';
  if (totalSpent >= loyaltyProgram.tier_silver_min) return 'silver';
  return 'bronze';
}

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const { 
      search, 
      tier, 
      is_active,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const whereClause = {};
    
    if (search) {
      whereClause[sequelize.Op.or] = [
        { name: { [sequelize.Op.iLike]: `%${search}%` } },
        { phone: { [sequelize.Op.iLike]: `%${search}%` } },
        { customer_code: { [sequelize.Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (tier) {
      whereClause.loyalty_tier = tier;
    }
    
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: customers } = await Customer.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['username', 'full_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      data: customers,
      pagination: {
        total_items: count,
        total_pages: totalPages,
        current_page: parseInt(page),
        items_per_page: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Search customer by phone or code
exports.searchCustomer = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Query pencarian diperlukan'
      });
    }
    
    const customer = await Customer.findOne({
      where: {
        [sequelize.Op.or]: [
          { phone: query },
          { customer_code: query.toUpperCase() }
        ],
        is_active: true
      }
    });
    
    if (!customer) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer tidak ditemukan'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: customer
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Create customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, email, birth_date, gender, address } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama dan nomor telepon diperlukan'
      });
    }
    
    // Check if phone already exists
    const existingCustomer = await Customer.findOne({
      where: { phone }
    });
    
    if (existingCustomer) {
      return res.status(400).json({
        status: 'error',
        message: 'Nomor telepon sudah terdaftar'
      });
    }
    
    const customerData = {
      customer_code: generateCustomerCode(),
      name,
      phone,
      email: email || null,
      birth_date: birth_date || null,
      gender: gender || null,
      address: address || null,
      created_by: req.user.id,
      updated_by: req.user.id
    };
    
    const customer = await Customer.create(customerData);
    
    return res.status(201).json({
      status: 'success',
      message: 'Customer berhasil didaftarkan',
      data: customer
    });
    
  } catch (error) {
    console.error(error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer tidak ditemukan'
      });
    }
    
    const updateData = {
      ...req.body,
      updated_by: req.user.id
    };
    
    // Don't allow changing customer_code and loyalty_points directly
    delete updateData.customer_code;
    delete updateData.loyalty_points;
    delete updateData.total_spent;
    delete updateData.visit_count;
    
    await customer.update(updateData);
    
    return res.status(200).json({
      status: 'success',
      message: 'Customer berhasil diperbarui',
      data: customer
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get customer transactions
exports.getCustomerTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: { customer_id: id },
      include: [
        {
          model: User,
          attributes: ['username', 'full_name']
        }
      ],
      order: [['transaction_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      data: transactions,
      pagination: {
        total_items: count,
        total_pages: totalPages,
        current_page: parseInt(page),
        items_per_page: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get customer point history
exports.getCustomerPointHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const { count, rows: pointHistory } = await PointTransaction.findAndCountAll({
      where: { customer_id: id },
      include: [
        {
          model: User,
          as: 'ProcessedBy',
          attributes: ['username', 'full_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      data: pointHistory,
      pagination: {
        total_items: count,
        total_pages: totalPages,
        current_page: parseInt(page),
        items_per_page: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Update customer after transaction (internal use)
async function updateCustomerAfterTransaction(customerId, transactionAmount, earnedPoints, userId) {
  try {
    const customer = await Customer.findByPk(customerId);
    if (!customer) return false;
    
    // Get loyalty program settings
    const loyaltyProgram = await LoyaltyProgram.findOne({
      where: { is_active: true },
      order: [['updated_at', 'DESC']]
    });
    
    // Update customer stats
    const newTotalSpent = customer.total_spent + transactionAmount;
    const newVisitCount = customer.visit_count + 1;
    const newLoyaltyPoints = customer.loyalty_points + earnedPoints;
    const newTier = calculateLoyaltyTier(newTotalSpent, loyaltyProgram);
    
    await customer.update({
      total_spent: newTotalSpent,
      visit_count: newVisitCount,
      loyalty_points: newLoyaltyPoints,
      loyalty_tier: newTier,
      last_visit: new Date(),
      updated_by: userId
    });
    
    return true;
  } catch (error) {
    console.error('Error updating customer:', error);
    return false;
  }
}

module.exports = { updateCustomerAfterTransaction };