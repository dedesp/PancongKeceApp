const { 
  Transaction, 
  TransactionItem, 
  Product, 
  PaymentMethod, 
  User, 
  Inventory, 
  InventoryLog, 
  TaxSetting,
  Discount,
  RoundingSetting,
  sequelize 
} = require('../models');
const { calculateDiscountAmount } = require('./discount.controller');
const { applyRoundingToAmount } = require('./roundingSetting.controller');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// Generate transaction number
const generateTransactionNumber = () => {
  const prefix = 'TRX';
  const date = moment().format('YYMMDD');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${prefix}${date}${random}`;
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      payment_method_id, 
      payment_status,
      user_id,
      sort_by = 'transaction_date',
      sort_order = 'desc',
      page = 1,
      limit = 10
    } = req.query;
    
    // Build where clause
    const whereClause = {};
    
    if (start_date && end_date) {
      whereClause.transaction_date = {
        [sequelize.Op.between]: [
          moment(start_date).startOf('day').toDate(),
          moment(end_date).endOf('day').toDate()
        ]
      };
    } else if (start_date) {
      whereClause.transaction_date = {
        [sequelize.Op.gte]: moment(start_date).startOf('day').toDate()
      };
    } else if (end_date) {
      whereClause.transaction_date = {
        [sequelize.Op.lte]: moment(end_date).endOf('day').toDate()
      };
    }
    
    if (payment_method_id) {
      whereClause.payment_method_id = payment_method_id;
    }
    
    if (payment_status) {
      whereClause.payment_status = payment_status;
    }
    
    if (user_id) {
      whereClause.user_id = user_id;
    }
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get transactions
    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Cashier',
          attributes: ['id', 'username', 'full_name']
        },
        {
          model: PaymentMethod,
          attributes: ['id', 'name', 'code']
        },
        {
          model: TransactionItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'price']
            }
          ]
        }
      ],
      order: [[sort_by, sort_order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      message: 'Transaksi berhasil dimuat',
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

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Cashier',
          attributes: ['id', 'username', 'full_name']
        },
        {
          model: PaymentMethod,
          attributes: ['id', 'name', 'code']
        },
        {
          model: TransactionItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'price']
            }
          ]
        }
      ]
    });
    
    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaksi tidak ditemukan'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Transaksi berhasil dimuat',
      data: transaction
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Create new transaction
exports.createTransaction = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      items, 
      payment_method_id, 
      discount_code,
      notes,
      customer_name,
      paid_amount = 0
    } = req.body;
    
    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Detail item transaksi diperlukan'
      });
    }
    
    if (!payment_method_id) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Metode pembayaran diperlukan'
      });
    }
    
    // Check if payment method exists
    const paymentMethod = await PaymentMethod.findByPk(payment_method_id);
    if (!paymentMethod) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Metode pembayaran tidak ditemukan'
      });
    }
    
    // Check product availability and calculate total
    let totalAmount = 0;
    const processedItems = [];
    
    for (const item of items) {
      const { product_id, quantity } = item;
      
      if (!product_id || !quantity || quantity <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'ID produk dan jumlah diperlukan untuk setiap item'
        });
      }
      
      // Get product
      const product = await Product.findByPk(product_id, {
        include: [
          {
            model: Inventory,
            attributes: ['quantity']
          }
        ]
      });
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: `Produk dengan ID ${product_id} tidak ditemukan`
        });
      }
      
      if (!product.is_active) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: `Produk ${product.name} tidak aktif`
        });
      }
      
      // Check stock
      if (!product.inventory || product.inventory.quantity < quantity) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: `Stok tidak mencukupi untuk produk ${product.name}`
        });
      }
      
      // Calculate subtotal
      const unitPrice = product.price;
      const subtotal = unitPrice * quantity;
      totalAmount += subtotal;
      
      processedItems.push({
        id: uuidv4(),
        product_id,
        quantity,
        unit_price: unitPrice,
        subtotal,
        discount: item.discount || 0,
        notes: item.notes || null,
        product_name: product.name
      });
    }
    
    // Apply discount if provided
    let discountAmount = 0;
    let discountDetails = null;
    
    if (discount_code) {
      const discount = await Discount.findOne({
        where: { 
          code: discount_code.toUpperCase(),
          is_active: true 
        }
      });
      
      if (discount) {
        const discountCalculation = calculateDiscountAmount(discount, processedItems, totalAmount);
        discountAmount = discountCalculation.discount_amount;
        discountDetails = discountCalculation;
        
        // Update discount usage count
        await discount.increment('usage_count');
      }
    }
    
    // Calculate tax and service charges
    const subtotalAfterDiscount = totalAmount - discountAmount;
    
    // Get active tax settings
    const taxSettings = await TaxSetting.findAll({
      where: { is_active: true },
      order: [['apply_before_service', 'DESC'], ['setting_key', 'ASC']]
    });
    
    let taxAmount = 0;
    let serviceAmount = 0;
    let currentAmount = subtotalAfterDiscount;
    
    // Process settings that apply before service charge
    for (const setting of taxSettings.filter(s => s.apply_before_service)) {
      const amount = Math.round(currentAmount * (setting.percentage / 100));
      
      if (setting.setting_key === 'service_charge') {
        serviceAmount += amount;
      } else {
        taxAmount += amount;
      }
      
      currentAmount += amount;
    }
    
    // Process settings that apply after service charge
    for (const setting of taxSettings.filter(s => !s.apply_before_service)) {
      const amount = Math.round(currentAmount * (setting.percentage / 100));
      
      if (setting.setting_key === 'service_charge') {
        serviceAmount += amount;
      } else {
        taxAmount += amount;
      }
      
      currentAmount += amount;
    }
    
    let finalAmount = currentAmount;
    
    // Apply rounding if enabled
    const roundingSetting = await RoundingSetting.findOne({
      order: [['updated_at', 'DESC']]
    });
    
    let roundingAmount = 0;
    if (roundingSetting && roundingSetting.is_active) {
      const roundedAmount = applyRoundingToAmount(finalAmount, roundingSetting);
      roundingAmount = roundedAmount - finalAmount;
      finalAmount = roundedAmount;
    }
    
    // Calculate change amount for cash payments
    let changeAmount = 0;
    if (paymentMethod.code === 'CASH') {
      if (paid_amount < finalAmount) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: `Jumlah pembayaran (Rp ${paid_amount.toLocaleString('id-ID')}) kurang dari total (Rp ${finalAmount.toLocaleString('id-ID')})`
        });
      }
      changeAmount = paid_amount - finalAmount;
    }
    
    // Generate transaction ID and number
    const transactionId = uuidv4();
    const transactionNumber = generateTransactionNumber();
    
    // Create transaction
    const newTransaction = await Transaction.create({
      id: transactionId,
      transaction_number: transactionNumber,
      transaction_date: new Date(),
      user_id: req.user.id,
      payment_method_id,
      total_amount: totalAmount,
      tax_amount: taxAmount,
      service_amount: serviceAmount,
      discount_amount: discountAmount,
      discount_details: discountDetails,
      rounding_amount: roundingAmount,
      final_amount: finalAmount,
      paid_amount: paymentMethod.code === 'CASH' ? paid_amount : finalAmount,
      change_amount: changeAmount,
      payment_status: 'paid',
      notes,
      customer_name,
      receipt_printed: false
    }, { transaction });
    
    // Create transaction items
    for (const item of processedItems) {
      await TransactionItem.create({
        ...item,
        transaction_id: transactionId
      }, { transaction });
      
      // Update inventory
      const inventory = await Inventory.findOne({
        where: { product_id: item.product_id }
      });
      
      const previousQuantity = inventory.quantity;
      const newQuantity = previousQuantity - item.quantity;
      
      await inventory.update({
        quantity: newQuantity,
        last_updated_by: req.user.id
      }, { transaction });
      
      // Create inventory log
      await InventoryLog.create({
        product_id: item.product_id,
        type: 'out',
        quantity: item.quantity,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        user_id: req.user.id,
        notes: `Penjualan: ${transactionNumber}`,
        reference_id: transactionId,
        reference_type: 'transaction'
      }, { transaction });
    }
    
    await transaction.commit();
    
    // Get created transaction with details
    const createdTransaction = await Transaction.findByPk(transactionId, {
      include: [
        {
          model: User,
          as: 'Cashier',
          attributes: ['id', 'username', 'full_name']
        },
        {
          model: PaymentMethod,
          attributes: ['id', 'name', 'code']
        },
        {
          model: TransactionItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'price']
            }
          ]
        }
      ]
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Transaksi berhasil dibuat',
      data: createdTransaction
    });
    
  } catch (error) {
    await transaction.rollback();
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

// Update transaction (for receipt printing status)
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { receipt_printed } = req.body;
    
    // Find transaction
    const transaction = await Transaction.findByPk(id);
    
    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaksi tidak ditemukan'
      });
    }
    
    // Update transaction
    await transaction.update({
      receipt_printed: receipt_printed !== undefined ? receipt_printed : transaction.receipt_printed
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Status cetak struk berhasil diperbarui',
      data: transaction
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Cancel transaction
exports.cancelTransaction = async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Find transaction
    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: TransactionItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });
    
    if (!transaction) {
      await dbTransaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Transaksi tidak ditemukan'
      });
    }
    
    // Check if transaction can be cancelled
    if (transaction.payment_status === 'refunded') {
      await dbTransaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Transaksi sudah dibatalkan'
      });
    }
    
    // Update transaction status
    await transaction.update({
      payment_status: 'refunded',
      notes: reason ? `${transaction.notes || ''} | Dibatalkan: ${reason}` : transaction.notes
    }, { transaction: dbTransaction });
    
    // Restore inventory
    for (const item of transaction.transaction_items) {
      // Update inventory
      const inventory = await Inventory.findOne({
        where: { product_id: item.product_id }
      });
      
      const previousQuantity = inventory.quantity;
      const newQuantity = previousQuantity + item.quantity;
      
      await inventory.update({
        quantity: newQuantity,
        last_updated_by: req.user.id
      }, { transaction: dbTransaction });
      
      // Create inventory log
      await InventoryLog.create({
        product_id: item.product_id,
        type: 'in',
        quantity: item.quantity,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        user_id: req.user.id,
        notes: `Pembatalan: ${transaction.transaction_number}`,
        reference_id: transaction.id,
        reference_type: 'refund'
      }, { transaction: dbTransaction });
    }
    
    await dbTransaction.commit();
    
    return res.status(200).json({
      status: 'success',
      message: 'Transaksi berhasil dibatalkan',
      data: transaction
    });
    
  } catch (error) {
    await dbTransaction.rollback();
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};