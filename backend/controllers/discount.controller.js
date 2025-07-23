const { Discount, User, Product, Category, sequelize } = require('../models');
const moment = require('moment');

// Get all discounts
exports.getAllDiscounts = async (req, res) => {
  try {
    const { 
      is_active, 
      type, 
      search,
      page = 1,
      limit = 10
    } = req.query;
    
    // Build where clause
    const whereClause = {};
    
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (search) {
      whereClause[sequelize.Op.or] = [
        { code: { [sequelize.Op.iLike]: `%${search}%` } },
        { name: { [sequelize.Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get discounts
    const { count, rows: discounts } = await Discount.findAndCountAll({
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
    
    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      data: discounts,
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

// Get active discounts
exports.getActiveDiscounts = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    
    const discounts = await Discount.findAll({
      where: {
        is_active: true,
        start_date: { [sequelize.Op.lte]: today },
        end_date: { [sequelize.Op.gte]: today },
        [sequelize.Op.or]: [
          { usage_limit: null },
          { usage_count: { [sequelize.Op.lt]: sequelize.col('usage_limit') } }
        ]
      },
      order: [['created_at', 'DESC']]
    });
    
    return res.status(200).json({
      status: 'success',
      data: discounts
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Validate discount code
exports.validateDiscount = async (req, res) => {
  try {
    const { code, cart_items, subtotal } = req.body;
    
    if (!code) {
      return res.status(400).json({
        status: 'error',
        message: 'Kode diskon diperlukan'
      });
    }
    
    // Find discount
    const discount = await Discount.findOne({
      where: { 
        code: code.toUpperCase(),
        is_active: true 
      }
    });
    
    if (!discount) {
      return res.status(404).json({
        status: 'error',
        message: 'Kode diskon tidak valid'
      });
    }
    
    // Check date validity
    const today = moment().format('YYYY-MM-DD');
    if (moment(today).isBefore(discount.start_date) || moment(today).isAfter(discount.end_date)) {
      return res.status(400).json({
        status: 'error',
        message: 'Kode diskon sudah kadaluarsa atau belum berlaku'
      });
    }
    
    // Check usage limit
    if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
      return res.status(400).json({
        status: 'error',
        message: 'Kode diskon sudah mencapai batas penggunaan'
      });
    }
    
    // Check minimum purchase
    if (discount.minimum_purchase > 0 && subtotal < discount.minimum_purchase) {
      return res.status(400).json({
        status: 'error',
        message: `Minimal pembelian Rp ${discount.minimum_purchase.toLocaleString('id-ID')} untuk menggunakan diskon ini`
      });
    }
    
    // Calculate discount
    const discountCalculation = calculateDiscountAmount(discount, cart_items, subtotal);
    
    return res.status(200).json({
      status: 'success',
      message: 'Kode diskon valid',
      data: {
        discount: discount,
        calculation: discountCalculation
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

// Create discount
exports.createDiscount = async (req, res) => {
  try {
    const discountData = {
      ...req.body,
      code: req.body.code.toUpperCase(),
      created_by: req.user.id,
      updated_by: req.user.id
    };
    
    // Validate dates
    if (moment(discountData.start_date).isAfter(discountData.end_date)) {
      return res.status(400).json({
        status: 'error',
        message: 'Tanggal mulai tidak boleh lebih dari tanggal berakhir'
      });
    }
    
    const discount = await Discount.create(discountData);
    
    return res.status(201).json({
      status: 'success',
      message: 'Diskon berhasil dibuat',
      data: discount
    });
    
  } catch (error) {
    console.error(error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'error',
        message: 'Kode diskon sudah digunakan'
      });
    }
    
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

// Update discount
exports.updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    
    const discount = await Discount.findByPk(id);
    
    if (!discount) {
      return res.status(404).json({
        status: 'error',
        message: 'Diskon tidak ditemukan'
      });
    }
    
    const updateData = {
      ...req.body,
      updated_by: req.user.id
    };
    
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    
    await discount.update(updateData);
    
    return res.status(200).json({
      status: 'success',
      message: 'Diskon berhasil diperbarui',
      data: discount
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Delete discount
exports.deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    
    const discount = await Discount.findByPk(id);
    
    if (!discount) {
      return res.status(404).json({
        status: 'error',
        message: 'Diskon tidak ditemukan'
      });
    }
    
    await discount.destroy();
    
    return res.status(200).json({
      status: 'success',
      message: 'Diskon berhasil dihapus'
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Helper function to calculate discount amount
function calculateDiscountAmount(discount, cartItems, subtotal) {
  let discountAmount = 0;
  let discountDetails = [];
  
  switch (discount.type) {
    case 'percentage':
      discountAmount = Math.round(subtotal * (discount.value / 100));
      
      // Apply max discount limit
      if (discount.max_discount_amount && discountAmount > discount.max_discount_amount) {
        discountAmount = discount.max_discount_amount;
      }
      
      discountDetails.push({
        type: 'percentage',
        description: `${discount.name} (${discount.value}%)`,
        amount: discountAmount
      });
      break;
      
    case 'fixed_amount':
      discountAmount = Math.min(discount.value, subtotal);
      
      discountDetails.push({
        type: 'fixed_amount',
        description: `${discount.name}`,
        amount: discountAmount
      });
      break;
      
    case 'buy_x_get_y':
      // Calculate applicable items
      let applicableItems = cartItems;
      
      if (discount.applicable_to !== 'all') {
        applicableItems = cartItems.filter(item => {
          if (discount.applicable_to === 'category') {
            return discount.applicable_items.includes(item.category_id);
          } else if (discount.applicable_to === 'product') {
            return discount.applicable_items.includes(item.product_id);
          }
          return false;
        });
      }
      
      // Calculate free items
      applicableItems.forEach(item => {
        const setsOfBuy = Math.floor(item.quantity / discount.buy_quantity);
        const freeItems = setsOfBuy * discount.get_quantity;
        const freeAmount = freeItems * item.unit_price;
        
        if (freeItems > 0) {
          discountAmount += freeAmount;
          discountDetails.push({
            type: 'buy_x_get_y',
            description: `${discount.name} - ${item.product_name}`,
            amount: freeAmount,
            free_quantity: freeItems
          });
        }
      });
      break;
      
    case 'minimum_purchase':
      if (subtotal >= discount.minimum_purchase) {
        discountAmount = Math.round(subtotal * (discount.value / 100));
        
        if (discount.max_discount_amount && discountAmount > discount.max_discount_amount) {
          discountAmount = discount.max_discount_amount;
        }
        
        discountDetails.push({
          type: 'minimum_purchase',
          description: `${discount.name} (${discount.value}%)`,
          amount: discountAmount
        });
      }
      break;
  }
  
  return {
    discount_amount: discountAmount,
    discount_details: discountDetails,
    discount_info: {
      id: discount.id,
      code: discount.code,
      name: discount.name,
      type: discount.type
    }
  };
}

module.exports = {
  getAllDiscounts: exports.getAllDiscounts,
  getActiveDiscounts: exports.getActiveDiscounts,
  validateDiscount: exports.validateDiscount,
  createDiscount: exports.createDiscount,
  updateDiscount: exports.updateDiscount,
  deleteDiscount: exports.deleteDiscount,
  calculateDiscountAmount
};