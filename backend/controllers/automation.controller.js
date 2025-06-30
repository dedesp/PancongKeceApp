const { 
  AutomationRule, 
  Customer, 
  CustomerCommunication,
  WhatsAppIntegration,
  WhatsAppMessage,
  MarketingCampaign,
  User,
  sequelize 
} = require('../models');
const moment = require('moment');

// Get all automation rules
exports.getAutomationRules = async (req, res) => {
  try {
    const { page = 1, limit = 20, is_active } = req.query;
    
    const whereClause = {};
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: rules } = await AutomationRule.findAndCountAll({
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
      data: rules,
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

// Create automation rule
exports.createAutomationRule = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      trigger_type, 
      trigger_conditions, 
      action_type, 
      action_config,
      target_segments 
    } = req.body;
    
    if (!name || !trigger_type || !action_type || !action_config) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama, trigger type, action type, dan action config diperlukan'
      });
    }
    
    // Calculate next execution for scheduled rules
    let nextExecution = null;
    if (trigger_type === 'scheduled_time' && trigger_conditions.schedule) {
      nextExecution = moment().add(1, 'day').startOf('day');
      if (trigger_conditions.schedule.time) {
        const [hour, minute] = trigger_conditions.schedule.time.split(':');
        nextExecution.hour(parseInt(hour)).minute(parseInt(minute));
      }
    }
    
    const rule = await AutomationRule.create({
      name,
      description: description || null,
      trigger_type,
      trigger_conditions: trigger_conditions || {},
      action_type,
      action_config,
      target_segments: target_segments || [],
      next_execution: nextExecution,
      created_by: req.user.id,
      updated_by: req.user.id
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Automation rule berhasil dibuat',
      data: rule
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Execute automation rule manually
exports.executeAutomationRule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rule = await AutomationRule.findByPk(id);
    if (!rule) {
      return res.status(404).json({
        status: 'error',
        message: 'Automation rule tidak ditemukan'
      });
    }
    
    if (!rule.is_active) {
      return res.status(400).json({
        status: 'error',
        message: 'Automation rule tidak aktif'
      });
    }
    
    const result = await executeRule(rule, req.user.id);
    
    return res.status(200).json({
      status: 'success',
      message: 'Automation rule berhasil dijalankan',
      data: result
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Process birthday automation
exports.processBirthdayAutomation = async (req, res) => {
  try {
    const today = moment().format('MM-DD'); // Format: MM-DD
    
    // Find customers with birthday today
    const birthdayCustomers = await Customer.findAll({
      where: {
        is_active: true,
        birth_date: {
          [sequelize.Op.not]: null
        }
      }
    });
    
    const todayBirthdays = birthdayCustomers.filter(customer => {
      if (!customer.birth_date) return false;
      const birthDate = moment(customer.birth_date).format('MM-DD');
      return birthDate === today;
    });
    
    // Find active birthday automation rules
    const birthdayRules = await AutomationRule.findAll({
      where: {
        trigger_type: 'birthday',
        is_active: true
      }
    });
    
    let processedCount = 0;
    
    for (const customer of todayBirthdays) {
      for (const rule of birthdayRules) {
        await executeRule(rule, null, customer);
        processedCount++;
      }
    }
    
    return res.status(200).json({
      status: 'success',
      message: `Birthday automation berhasil diproses untuk ${todayBirthdays.length} customer`,
      data: {
        birthday_customers: todayBirthdays.length,
        rules_executed: processedCount
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

// Helper function to execute automation rule
async function executeRule(rule, userId = null, targetCustomer = null) {
  try {
    let affectedCustomers = [];
    
    // Determine target customers
    if (targetCustomer) {
      affectedCustomers = [targetCustomer];
    } else {
      // Build query based on trigger conditions and target segments
      let whereClause = { is_active: true };
      
      if (rule.target_segments && rule.target_segments.length > 0) {
        // Apply segment criteria (simplified for demo)
        // In real implementation, this would query CustomerSegment and apply criteria
        whereClause.loyalty_tier = { [sequelize.Op.in]: ['gold', 'platinum'] };
      }
      
      if (rule.trigger_conditions) {
        if (rule.trigger_conditions.tier) {
          whereClause.loyalty_tier = rule.trigger_conditions.tier;
        }
        if (rule.trigger_conditions.min_spent) {
          whereClause.total_spent = { [sequelize.Op.gte]: rule.trigger_conditions.min_spent };
        }
      }
      
      affectedCustomers = await Customer.findAll({ where: whereClause });
    }
    
    let executionResults = [];
    
    // Execute action for each customer
    for (const customer of affectedCustomers) {
      let actionResult = null;
      
      switch (rule.action_type) {
        case 'send_message':
          actionResult = await sendAutomatedMessage(customer, rule.action_config, userId);
          break;
          
        case 'add_points':
          actionResult = await addAutomatedPoints(customer, rule.action_config, userId);
          break;
          
        case 'create_discount':
          actionResult = await createAutomatedDiscount(customer, rule.action_config, userId);
          break;
          
        case 'assign_segment':
          actionResult = await assignCustomerSegment(customer, rule.action_config, userId);
          break;
          
        default:
          actionResult = { status: 'skipped', message: 'Action type not implemented' };
      }
      
      executionResults.push({
        customer_id: customer.id,
        customer_name: customer.name,
        action_result: actionResult
      });
    }
    
    // Update rule execution statistics
    await rule.update({
      execution_count: rule.execution_count + 1,
      last_executed: new Date(),
      next_execution: calculateNextExecution(rule)
    });
    
    return {
      rule_id: rule.id,
      rule_name: rule.name,
      customers_affected: affectedCustomers.length,
      execution_results: executionResults
    };
    
  } catch (error) {
    console.error('Error executing automation rule:', error);
    throw error;
  }
}

// Helper function to send automated message
async function sendAutomatedMessage(customer, actionConfig, userId) {
  try {
    const { message_template, channel = 'whatsapp' } = actionConfig;
    
    // Replace placeholders in message template
    let personalizedMessage = message_template
      .replace('{name}', customer.name)
      .replace('{tier}', customer.loyalty_tier)
      .replace('{points}', customer.loyalty_points);
    
    // Log communication
    await CustomerCommunication.create({
      customer_id: customer.id,
      type: channel,
      direction: 'outbound',
      subject: 'Automated Message',
      message: personalizedMessage,
      status: 'sent',
      sent_at: new Date(),
      tags: ['automation', 'birthday_greeting'],
      created_by: userId
    });
    
    return { status: 'success', message: 'Message sent successfully' };
    
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

// Helper function to add automated points
async function addAutomatedPoints(customer, actionConfig, userId) {
  try {
    const { points_amount, description = 'Bonus automation' } = actionConfig;
    
    // Update customer points
    await customer.update({
      loyalty_points: customer.loyalty_points + points_amount
    });
    
    // Create point transaction record (simplified)
    // In real implementation, use PointTransaction model
    
    return { 
      status: 'success', 
      message: `Added ${points_amount} points`,
      points_added: points_amount 
    };
    
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

// Helper function to create automated discount
async function createAutomatedDiscount(customer, actionConfig, userId) {
  try {
    const { discount_type, discount_value, validity_days = 7 } = actionConfig;
    
    // Create personal discount code
    const discountCode = `AUTO${customer.customer_code}${Date.now().toString().slice(-4)}`;
    
    // In real implementation, create discount in Discount model
    
    return { 
      status: 'success', 
      message: 'Personal discount created',
      discount_code: discountCode 
    };
    
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

// Helper function to assign customer segment
async function assignCustomerSegment(customer, actionConfig, userId) {
  try {
    const { segment_id } = actionConfig;
    
    // In real implementation, update customer segment assignment
    
    return { 
      status: 'success', 
      message: 'Customer assigned to segment',
      segment_id: segment_id 
    };
    
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

// Helper function to calculate next execution time
function calculateNextExecution(rule) {
  if (rule.trigger_type === 'scheduled_time' && rule.trigger_conditions.schedule) {
    const next = moment().add(1, 'day').startOf('day');
    if (rule.trigger_conditions.schedule.time) {
      const [hour, minute] = rule.trigger_conditions.schedule.time.split(':');
      next.hour(parseInt(hour)).minute(parseInt(minute));
    }
    return next.toDate();
  }
  
  return null;
}

module.exports = { executeRule };