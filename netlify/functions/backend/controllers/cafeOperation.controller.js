const { CafeOperationLog, User, Transaction, sequelize } = require('../models');
const moment = require('moment');

// Get today's operation status
exports.getTodayOperationStatus = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    
    const operations = await CafeOperationLog.findAll({
      where: { operation_date: today },
      include: [{
        model: User,
        attributes: ['username', 'full_name']
      }],
      order: [['timestamp', 'ASC']]
    });
    
    let status = 'closed';
    let lastOperation = null;
    
    if (operations.length > 0) {
      const lastOp = operations[operations.length - 1];
      status = lastOp.operation_type === 'open' ? 'open' : 'closed';
      lastOperation = lastOp;
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        cafe_status: status,
        operation_date: today,
        operations: operations,
        last_operation: lastOperation
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

// Open cafe
exports.openCafe = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { opening_cash = 0, notes } = req.body;
    const today = moment().format('YYYY-MM-DD');
    
    // Check if cafe is already open today
    const existingOpen = await CafeOperationLog.findOne({
      where: {
        operation_date: today,
        operation_type: 'open'
      },
      order: [['timestamp', 'DESC']]
    });
    
    if (existingOpen) {
      // Check if there's a close operation after the last open
      const lastClose = await CafeOperationLog.findOne({
        where: {
          operation_date: today,
          operation_type: 'close',
          timestamp: { [sequelize.Op.gt]: existingOpen.timestamp }
        }
      });
      
      if (!lastClose) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'Cafe sudah dibuka hari ini'
        });
      }
    }
    
    // Create open operation log
    const openLog = await CafeOperationLog.create({
      operation_date: today,
      operation_type: 'open',
      user_id: req.user.id,
      opening_cash: parseInt(opening_cash),
      notes: notes || null,
      pos_terminal: req.body.pos_terminal || 'POS-01'
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(201).json({
      status: 'success',
      message: 'Cafe berhasil dibuka',
      data: openLog
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Close cafe
exports.closeCafe = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { closing_cash = 0, notes } = req.body;
    const today = moment().format('YYYY-MM-DD');
    
    // Check if cafe is open
    const lastOpen = await CafeOperationLog.findOne({
      where: {
        operation_date: today,
        operation_type: 'open'
      },
      order: [['timestamp', 'DESC']]
    });
    
    if (!lastOpen) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Cafe belum dibuka hari ini'
      });
    }
    
    // Check if already closed after last open
    const lastClose = await CafeOperationLog.findOne({
      where: {
        operation_date: today,
        operation_type: 'close',
        timestamp: { [sequelize.Op.gt]: lastOpen.timestamp }
      }
    });
    
    if (lastClose) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Cafe sudah ditutup'
      });
    }
    
    // Calculate today's sales summary
    const salesSummary = await Transaction.findOne({
      where: {
        transaction_date: {
          [sequelize.Op.gte]: moment(today).startOf('day').toDate(),
          [sequelize.Op.lt]: moment(today).add(1, 'day').startOf('day').toDate()
        },
        payment_status: 'paid'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_transactions'],
        [sequelize.fn('SUM', sequelize.col('final_amount')), 'total_sales']
      ],
      raw: true
    });
    
    const totalTransactions = parseInt(salesSummary.total_transactions) || 0;
    const totalSales = parseInt(salesSummary.total_sales) || 0;
    
    // Calculate expected cash (opening cash + cash transactions)
    const cashTransactions = await Transaction.sum('final_amount', {
      where: {
        transaction_date: {
          [sequelize.Op.gte]: moment(today).startOf('day').toDate(),
          [sequelize.Op.lt]: moment(today).add(1, 'day').startOf('day').toDate()
        },
        payment_status: 'paid'
      },
      include: [{
        model: require('../models').PaymentMethod,
        where: { code: 'CASH' }
      }]
    });
    
    const expectedCash = lastOpen.opening_cash + (cashTransactions || 0);
    const cashDifference = parseInt(closing_cash) - expectedCash;
    
    // Create close operation log
    const closeLog = await CafeOperationLog.create({
      operation_date: today,
      operation_type: 'close',
      user_id: req.user.id,
      opening_cash: lastOpen.opening_cash,
      closing_cash: parseInt(closing_cash),
      expected_cash: expectedCash,
      cash_difference: cashDifference,
      total_transactions: totalTransactions,
      total_sales: totalSales,
      notes: notes || null,
      pos_terminal: req.body.pos_terminal || 'POS-01'
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(201).json({
      status: 'success',
      message: 'Cafe berhasil ditutup',
      data: {
        close_log: closeLog,
        summary: {
          opening_cash: lastOpen.opening_cash,
          closing_cash: parseInt(closing_cash),
          expected_cash: expectedCash,
          cash_difference: cashDifference,
          total_transactions: totalTransactions,
          total_sales: totalSales
        }
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get operation history
exports.getOperationHistory = async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      operation_type,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const whereClause = {};
    
    if (start_date && end_date) {
      whereClause.operation_date = {
        [sequelize.Op.between]: [start_date, end_date]
      };
    } else if (start_date) {
      whereClause.operation_date = {
        [sequelize.Op.gte]: start_date
      };
    } else if (end_date) {
      whereClause.operation_date = {
        [sequelize.Op.lte]: end_date
      };
    }
    
    if (operation_type) {
      whereClause.operation_type = operation_type;
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: operations } = await CafeOperationLog.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['username', 'full_name']
      }],
      order: [['operation_date', 'DESC'], ['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      data: operations,
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