const { 
  Customer, 
  CustomerSegment, 
  MarketingCampaign, 
  CustomerCommunication, 
  CustomerFeedback, 
  Lead,
  Transaction,
  User,
  sequelize 
} = require('../models');
const moment = require('moment');

// Customer Analytics Dashboard
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    let startDate;
    switch (period) {
      case '7d':
        startDate = moment().subtract(7, 'days').startOf('day');
        break;
      case '30d':
        startDate = moment().subtract(30, 'days').startOf('day');
        break;
      case '90d':
        startDate = moment().subtract(90, 'days').startOf('day');
        break;
      case '1y':
        startDate = moment().subtract(1, 'year').startOf('day');
        break;
      default:
        startDate = moment().subtract(30, 'days').startOf('day');
    }
    
    // Customer growth metrics
    const totalCustomers = await Customer.count({ where: { is_active: true } });
    const newCustomers = await Customer.count({
      where: {
        is_active: true,
        created_at: { [sequelize.Op.gte]: startDate.toDate() }
      }
    });
    
    // Tier distribution
    const tierDistribution = await Customer.findAll({
      attributes: [
        'loyalty_tier',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { is_active: true },
      group: ['loyalty_tier'],
      raw: true
    });
    
    // Customer lifetime value
    const clvData = await Customer.findAll({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('total_spent')), 'avg_clv'],
        [sequelize.fn('SUM', sequelize.col('total_spent')), 'total_clv'],
        [sequelize.fn('AVG', sequelize.col('visit_count')), 'avg_visits']
      ],
      where: { is_active: true },
      raw: true
    });
    
    // Recent transactions
    const recentTransactions = await Transaction.count({
      where: {
        transaction_date: { [sequelize.Op.gte]: startDate.toDate() },
        customer_id: { [sequelize.Op.not]: null }
      }
    });
    
    // Active campaigns
    const activeCampaigns = await MarketingCampaign.count({
      where: { status: ['running', 'scheduled'] }
    });
    
    // Pending feedback
    const pendingFeedback = await CustomerFeedback.count({
      where: { status: ['new', 'acknowledged'] }
    });
    
    // Lead conversion rate
    const totalLeads = await Lead.count();
    const convertedLeads = await Lead.count({
      where: { status: 'closed_won' }
    });
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0;
    
    return res.status(200).json({
      status: 'success',
      data: {
        overview: {
          total_customers: totalCustomers,
          new_customers: newCustomers,
          recent_transactions: recentTransactions,
          active_campaigns: activeCampaigns,
          pending_feedback: pendingFeedback,
          lead_conversion_rate: parseFloat(conversionRate)
        },
        tier_distribution: tierDistribution,
        customer_lifetime_value: {
          average: Math.round(clvData[0]?.avg_clv || 0),
          total: Math.round(clvData[0]?.total_clv || 0),
          average_visits: Math.round(clvData[0]?.avg_visits || 0)
        }
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

// Customer Segmentation
exports.createCustomerSegment = async (req, res) => {
  try {
    const { name, description, criteria, color } = req.body;
    
    if (!name || !criteria) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama segmen dan kriteria diperlukan'
      });
    }
    
    // Calculate target count based on criteria
    let whereClause = { is_active: true };
    
    // Build where clause from criteria
    if (criteria.tier && criteria.tier.length > 0) {
      whereClause.loyalty_tier = { [sequelize.Op.in]: criteria.tier };
    }
    
    if (criteria.totalSpentMin) {
      whereClause.total_spent = { [sequelize.Op.gte]: criteria.totalSpentMin };
    }
    
    if (criteria.totalSpentMax) {
      whereClause.total_spent = { 
        ...whereClause.total_spent,
        [sequelize.Op.lte]: criteria.totalSpentMax 
      };
    }
    
    if (criteria.visitCountMin) {
      whereClause.visit_count = { [sequelize.Op.gte]: criteria.visitCountMin };
    }
    
    if (criteria.lastVisitDays) {
      const cutoffDate = moment().subtract(criteria.lastVisitDays, 'days').toDate();
      whereClause.last_visit = { [sequelize.Op.gte]: cutoffDate };
    }
    
    const targetCount = await Customer.count({ where: whereClause });
    
    const segment = await CustomerSegment.create({
      name,
      description: description || null,
      criteria,
      target_count: targetCount,
      color: color || '#4a7c59',
      created_by: req.user.id,
      updated_by: req.user.id
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Segmen customer berhasil dibuat',
      data: segment
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get customers by segment
exports.getCustomersBySegment = async (req, res) => {
  try {
    const { segmentId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const segment = await CustomerSegment.findByPk(segmentId);
    if (!segment) {
      return res.status(404).json({
        status: 'error',
        message: 'Segmen tidak ditemukan'
      });
    }
    
    // Build where clause from segment criteria
    let whereClause = { is_active: true };
    const criteria = segment.criteria;
    
    if (criteria.tier && criteria.tier.length > 0) {
      whereClause.loyalty_tier = { [sequelize.Op.in]: criteria.tier };
    }
    
    if (criteria.totalSpentMin) {
      whereClause.total_spent = { [sequelize.Op.gte]: criteria.totalSpentMin };
    }
    
    if (criteria.totalSpentMax) {
      whereClause.total_spent = { 
        ...whereClause.total_spent,
        [sequelize.Op.lte]: criteria.totalSpentMax 
      };
    }
    
    if (criteria.visitCountMin) {
      whereClause.visit_count = { [sequelize.Op.gte]: criteria.visitCountMin };
    }
    
    if (criteria.lastVisitDays) {
      const cutoffDate = moment().subtract(criteria.lastVisitDays, 'days').toDate();
      whereClause.last_visit = { [sequelize.Op.gte]: cutoffDate };
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: customers } = await Customer.findAndCountAll({
      where: whereClause,
      order: [['last_visit', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      data: {
        segment: segment,
        customers: customers,
        pagination: {
          total_items: count,
          total_pages: totalPages,
          current_page: parseInt(page),
          items_per_page: parseInt(limit)
        }
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

// Send marketing campaign
exports.sendMarketingCampaign = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      type, 
      target_segments, 
      target_customers, 
      message_template, 
      subject,
      start_date 
    } = req.body;
    
    if (!name || !type || !message_template) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama, tipe, dan template pesan diperlukan'
      });
    }
    
    const campaign = await MarketingCampaign.create({
      name,
      description: description || null,
      type,
      target_segments: target_segments || [],
      target_customers: target_customers || [],
      message_template,
      subject: subject || null,
      start_date: start_date || new Date(),
      created_by: req.user.id,
      updated_by: req.user.id
    });
    
    // TODO: Implement actual sending logic based on type
    // For now, just mark as scheduled
    await campaign.update({ status: 'scheduled' });
    
    return res.status(201).json({
      status: 'success',
      message: 'Kampanye marketing berhasil dibuat dan dijadwalkan',
      data: campaign
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Add customer communication
exports.addCustomerCommunication = async (req, res) => {
  try {
    const { 
      customer_id, 
      type, 
      direction, 
      subject, 
      message, 
      priority,
      follow_up_required,
      follow_up_date,
      tags 
    } = req.body;
    
    if (!customer_id || !type || !direction || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Customer ID, tipe, arah, dan pesan diperlukan'
      });
    }
    
    const communication = await CustomerCommunication.create({
      customer_id,
      type,
      direction,
      subject: subject || null,
      message,
      priority: priority || 'medium',
      follow_up_required: follow_up_required || false,
      follow_up_date: follow_up_date || null,
      tags: tags || [],
      sent_at: direction === 'outbound' ? new Date() : null,
      created_by: req.user.id
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Komunikasi customer berhasil dicatat',
      data: communication
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get customer feedback
exports.getCustomerFeedback = async (req, res) => {
  try {
    const { 
      status, 
      type, 
      rating,
      category,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (rating) {
      whereClause.rating = parseInt(rating);
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: feedback } = await CustomerFeedback.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          attributes: ['name', 'phone', 'loyalty_tier']
        },
        {
          model: User,
          as: 'Responder',
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
      data: feedback,
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

// Create lead
exports.createLead = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      company, 
      source, 
      interest_level,
      estimated_value,
      expected_close_date,
      notes,
      assigned_to 
    } = req.body;
    
    if (!name || !source) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama dan sumber lead diperlukan'
      });
    }
    
    const lead = await Lead.create({
      name,
      phone: phone || null,
      email: email || null,
      company: company || null,
      source,
      interest_level: interest_level || 'warm',
      estimated_value: estimated_value || 0,
      expected_close_date: expected_close_date || null,
      notes: notes || null,
      assigned_to: assigned_to || req.user.id,
      created_by: req.user.id,
      updated_by: req.user.id
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Lead berhasil dibuat',
      data: lead
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get CRM dashboard summary
exports.getCRMDashboard = async (req, res) => {
  try {
    // Active leads by status
    const leadsByStatus = await Lead.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });
    
    // Recent communications
    const recentCommunications = await CustomerCommunication.findAll({
      include: [
        {
          model: Customer,
          attributes: ['name', 'phone']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });
    
    // Feedback summary
    const feedbackSummary = await CustomerFeedback.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']
      ],
      group: ['status'],
      raw: true
    });
    
    // Campaign performance
    const campaignStats = await MarketingCampaign.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_campaigns'],
        [sequelize.fn('SUM', sequelize.col('sent_count')), 'total_sent'],
        [sequelize.fn('SUM', sequelize.col('opened_count')), 'total_opened'],
        [sequelize.fn('SUM', sequelize.col('clicked_count')), 'total_clicked']
      ],
      raw: true
    });
    
    return res.status(200).json({
      status: 'success',
      data: {
        leads_by_status: leadsByStatus,
        recent_communications: recentCommunications,
        feedback_summary: feedbackSummary,
        campaign_stats: campaignStats[0] || {}
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