const { 
  Transaction, 
  Product, 
  Category, 
  TransactionItem, 
  Inventory, 
  User, 
  Employee, 
  PaymentMethod, 
  sequelize 
} = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({
        status: 'success',
        data: {
          today_sales: 2500000,
          transaction_count: 45,
          employee_count: 8,
          low_stock_count: 3,
          sales_by_category: [],
          sales_by_payment_method: [],
          last_7_days_sales: []
        }
      });
    }
    
    const today = moment().startOf('day');
    
    // Get total sales for today
    const todaySales = await Transaction.sum('final_amount', {
      where: {
        transaction_date: {
          [Op.gte]: today.toDate(),
          [Op.lt]: moment().endOf('day').toDate()
        },
        payment_status: 'paid'
      }
    }) || 0;
    
    // Get transaction count for today
    const transactionCount = await Transaction.count({
      where: {
        transaction_date: {
          [Op.gte]: today.toDate(),
          [Op.lt]: moment().endOf('day').toDate()
        },
        payment_status: 'paid'
      }
    });
    
    // Get active employee count
    const employeeCount = await Employee.count({
      where: {
        status: 'active'
      }
    });
    
    // Get low stock products
    const lowStockCount = await Inventory.count({
      where: sequelize.literal('quantity <= min_quantity')
    });
    
    // Sales by category (today)
    const salesByCategory = await TransactionItem.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('transaction_items.subtotal')), 'total_sales']
      ],
      include: [
        {
          model: Product,
          attributes: ['category_id'],
          include: [{
            model: Category,
            attributes: ['name']
          }]
        },
        {
          model: Transaction,
          attributes: [],
          where: {
            transaction_date: {
              [Op.gte]: today.toDate(),
              [Op.lt]: moment().endOf('day').toDate()
            },
            payment_status: 'paid'
          }
        }
      ],
      group: ['product.category_id', 'product.category.name'],
      raw: true
    });
    
    // Sales by payment method (today)
    const salesByPaymentMethod = await Transaction.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('final_amount')), 'total_sales']
      ],
      include: [{
        model: PaymentMethod,
        attributes: ['name']
      }],
      where: {
        transaction_date: {
          [Op.gte]: today.toDate(),
          [Op.lt]: moment().endOf('day').toDate()
        },
        payment_status: 'paid'
      },
      group: ['payment_method.id', 'payment_method.name'],
      raw: true
    });
    
    // Last 7 days sales
    const last7DaysSales = [];
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, 'days');
      const sales = await Transaction.sum('final_amount', {
        where: {
          transaction_date: {
            [Op.gte]: date.startOf('day').toDate(),
            [Op.lt]: date.endOf('day').toDate()
          },
          payment_status: 'paid'
        }
      }) || 0;
      
      last7DaysSales.push({
        date: date.format('YYYY-MM-DD'),
        day: date.format('ddd'),
        sales
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        today_sales: todaySales,
        transaction_count: transactionCount,
        employee_count: employeeCount,
        low_stock_count: lowStockCount,
        sales_by_category: salesByCategory,
        sales_by_payment_method: salesByPaymentMethod,
        last_7_days_sales: last7DaysSales
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

// Get recent transactions
exports.getRecentTransactions = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const transactions = await Transaction.findAll({
      include: [
        {
          model: User,
          as: 'Cashier',
          attributes: ['username', 'full_name']
        },
        {
          model: PaymentMethod,
          attributes: ['name']
        }
      ],
      order: [['transaction_date', 'DESC']],
      limit: parseInt(limit)
    });
    
    return res.status(200).json({
      status: 'success',
      data: transactions
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get top selling products
exports.getTopProducts = async (req, res) => {
  try {
    const { limit = 5, period = 'day' } = req.query;
    
    let startDate;
    const endDate = moment().endOf('day').toDate();
    
    // Determine period
    switch (period) {
      case 'week':
        startDate = moment().subtract(7, 'days').startOf('day').toDate();
        break;
      case 'month':
        startDate = moment().subtract(30, 'days').startOf('day').toDate();
        break;
      case 'year':
        startDate = moment().subtract(365, 'days').startOf('day').toDate();
        break;
      default: // day
        startDate = moment().startOf('day').toDate();
    }
    
    const topProducts = await TransactionItem.findAll({
      attributes: [
        'product_id',
        'product_name',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_sold'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'total_revenue']
      ],
      include: [
        {
          model: Transaction,
          attributes: [],
          where: {
            transaction_date: {
              [Op.between]: [startDate, endDate]
            },
            payment_status: 'paid'
          }
        },
        {
          model: Product,
          attributes: ['image_url', 'price'],
          include: [{
            model: Category,
            attributes: ['name']
          }]
        }
      ],
      group: ['transaction_items.product_id', 'transaction_items.product_name', 'product.id', 'product.image_url', 'product.price', 'product.category.id', 'product.category.name'],
      order: [[sequelize.literal('total_sold'), 'DESC']],
      limit: parseInt(limit)
    });
    
    return res.status(200).json({
      status: 'success',
      data: topProducts
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};