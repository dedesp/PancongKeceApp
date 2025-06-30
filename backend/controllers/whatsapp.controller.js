const { 
  WhatsAppIntegration, 
  WhatsAppMessage, 
  Customer, 
  MarketingCampaign,
  User,
  sequelize 
} = require('../models');
const axios = require('axios');
const moment = require('moment');

// Get WhatsApp integration settings
exports.getWhatsAppSettings = async (req, res) => {
  try {
    const integration = await WhatsAppIntegration.findOne({
      where: { is_active: true },
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['username', 'full_name']
        }
      ]
    });
    
    if (!integration) {
      return res.status(404).json({
        status: 'error',
        message: 'WhatsApp integration belum dikonfigurasi'
      });
    }
    
    // Don't expose sensitive data
    const safeIntegration = {
      ...integration.toJSON(),
      api_token: integration.api_token ? '***CONFIGURED***' : null,
      webhook_token: integration.webhook_token ? '***CONFIGURED***' : null
    };
    
    return res.status(200).json({
      status: 'success',
      data: safeIntegration
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Setup WhatsApp integration
exports.setupWhatsAppIntegration = async (req, res) => {
  try {
    const { 
      provider, 
      api_endpoint, 
      api_token, 
      phone_number_id, 
      business_name,
      default_template 
    } = req.body;
    
    if (!provider || !api_endpoint || !api_token) {
      return res.status(400).json({
        status: 'error',
        message: 'Provider, API endpoint, dan API token diperlukan'
      });
    }
    
    // Deactivate existing integrations
    await WhatsAppIntegration.update(
      { is_active: false },
      { where: { is_active: true } }
    );
    
    // Create new integration
    const integration = await WhatsAppIntegration.create({
      provider,
      api_endpoint,
      api_token: api_token, // In production, encrypt this
      phone_number_id: phone_number_id || null,
      business_name: business_name || 'Pancong Kece',
      default_template: default_template || 'Halo {name}, terima kasih telah berkunjung ke Pancong Kece!',
      created_by: req.user.id,
      updated_by: req.user.id
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'WhatsApp integration berhasil dikonfigurasi',
      data: {
        id: integration.id,
        provider: integration.provider,
        business_name: integration.business_name
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

// Send WhatsApp message
exports.sendWhatsAppMessage = async (req, res) => {
  try {
    const { 
      customer_id, 
      phone_number, 
      message, 
      message_type = 'text',
      template_name,
      template_params,
      media_url 
    } = req.body;
    
    if (!phone_number || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Nomor telepon dan pesan diperlukan'
      });
    }
    
    // Get active WhatsApp integration
    const integration = await WhatsAppIntegration.findOne({
      where: { is_active: true }
    });
    
    if (!integration) {
      return res.status(400).json({
        status: 'error',
        message: 'WhatsApp integration belum dikonfigurasi'
      });
    }
    
    // Check rate limit
    const today = moment().format('YYYY-MM-DD');
    if (integration.last_reset_date !== today) {
      await integration.update({
        messages_sent_today: 0,
        last_reset_date: today
      });
    }
    
    if (integration.messages_sent_today >= integration.rate_limit) {
      return res.status(429).json({
        status: 'error',
        message: 'Rate limit tercapai, coba lagi besok'
      });
    }
    
    // Create message record
    const whatsappMessage = await WhatsAppMessage.create({
      integration_id: integration.id,
      customer_id: customer_id || null,
      phone_number: phone_number.replace(/[^0-9]/g, ''), // Clean phone number
      message_type,
      content: message,
      media_url: media_url || null,
      template_name: template_name || null,
      template_params: template_params || [],
      created_by: req.user.id
    });
    
    // Send message through provider
    const sendResult = await sendMessageThroughProvider(integration, whatsappMessage);
    
    if (sendResult.success) {
      await whatsappMessage.update({
        status: 'sent',
        provider_message_id: sendResult.message_id,
        sent_at: new Date(),
        cost: sendResult.cost || 0
      });
      
      // Update integration stats
      await integration.update({
        messages_sent_today: integration.messages_sent_today + 1
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Pesan WhatsApp berhasil dikirim',
        data: {
          message_id: whatsappMessage.id,
          provider_message_id: sendResult.message_id,
          cost: sendResult.cost
        }
      });
    } else {
      await whatsappMessage.update({
        status: 'failed',
        error_message: sendResult.error
      });
      
      return res.status(400).json({
        status: 'error',
        message: 'Gagal mengirim pesan WhatsApp',
        error: sendResult.error
      });
    }
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Send broadcast message
exports.sendBroadcastMessage = async (req, res) => {
  try {
    const { 
      customer_segments, 
      customer_ids, 
      message, 
      template_name,
      template_params,
      schedule_time 
    } = req.body;
    
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Template pesan diperlukan'
      });
    }
    
    // Get target customers
    let targetCustomers = [];
    
    if (customer_ids && customer_ids.length > 0) {
      targetCustomers = await Customer.findAll({
        where: {
          id: { [sequelize.Op.in]: customer_ids },
          is_active: true,
          phone: { [sequelize.Op.not]: null }
        }
      });
    } else if (customer_segments && customer_segments.length > 0) {
      // Simplified segment query (in real implementation, apply segment criteria)
      targetCustomers = await Customer.findAll({
        where: {
          is_active: true,
          phone: { [sequelize.Op.not]: null },
          loyalty_tier: { [sequelize.Op.in]: ['gold', 'platinum'] } // Example criteria
        }
      });
    }
    
    if (targetCustomers.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Tidak ada customer target yang ditemukan'
      });
    }
    
    // Create marketing campaign
    const campaign = await MarketingCampaign.create({
      name: `WhatsApp Broadcast - ${moment().format('YYYY-MM-DD HH:mm')}`,
      type: 'whatsapp',
      status: schedule_time ? 'scheduled' : 'running',
      message_template: message,
      start_date: schedule_time || new Date(),
      created_by: req.user.id,
      updated_by: req.user.id
    });
    
    let sentCount = 0;
    let failedCount = 0;
    
    // Send messages (if not scheduled)
    if (!schedule_time) {
      for (const customer of targetCustomers) {
        try {
          // Personalize message
          const personalizedMessage = message
            .replace('{name}', customer.name)
            .replace('{tier}', customer.loyalty_tier)
            .replace('{points}', customer.loyalty_points);
          
          // Send message (mock implementation)
          const sendResult = await sendWhatsAppToCustomer(customer.phone, personalizedMessage, campaign.id, req.user.id);
          
          if (sendResult.success) {
            sentCount++;
          } else {
            failedCount++;
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`Failed to send to ${customer.phone}:`, error);
          failedCount++;
        }
      }
      
      // Update campaign stats
      await campaign.update({
        sent_count: sentCount,
        status: 'completed'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: schedule_time ? 'Broadcast dijadwalkan' : 'Broadcast berhasil dikirim',
      data: {
        campaign_id: campaign.id,
        target_customers: targetCustomers.length,
        sent_count: sentCount,
        failed_count: failedCount,
        scheduled_time: schedule_time
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

// Get WhatsApp message history
exports.getMessageHistory = async (req, res) => {
  try {
    const { 
      customer_id, 
      phone_number, 
      status,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const whereClause = {};
    
    if (customer_id) {
      whereClause.customer_id = customer_id;
    }
    
    if (phone_number) {
      whereClause.phone_number = phone_number;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: messages } = await WhatsAppMessage.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          attributes: ['name', 'customer_code', 'loyalty_tier']
        },
        {
          model: MarketingCampaign,
          attributes: ['name', 'type']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      status: 'success',
      data: messages,
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

// Helper function to send message through provider
async function sendMessageThroughProvider(integration, message) {
  try {
    // Mock implementation - replace with actual provider API call
    switch (integration.provider) {
      case 'whatsapp_business_api':
        return await sendViaWhatsAppBusinessAPI(integration, message);
      case 'twilio':
        return await sendViaTwilio(integration, message);
      case 'wablas':
        return await sendViaWablas(integration, message);
      default:
        return { success: false, error: 'Provider not supported' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Mock provider implementations
async function sendViaWhatsAppBusinessAPI(integration, message) {
  // Mock successful send
  return {
    success: true,
    message_id: `wa_${Date.now()}`,
    cost: 300 // Rp 300 per message
  };
}

async function sendViaTwilio(integration, message) {
  // Mock successful send
  return {
    success: true,
    message_id: `tw_${Date.now()}`,
    cost: 500 // Rp 500 per message
  };
}

async function sendViaWablas(integration, message) {
  // Mock successful send
  return {
    success: true,
    message_id: `wb_${Date.now()}`,
    cost: 200 // Rp 200 per message
  };
}

// Helper function to send WhatsApp to customer
async function sendWhatsAppToCustomer(phoneNumber, message, campaignId, userId) {
  try {
    const integration = await WhatsAppIntegration.findOne({
      where: { is_active: true }
    });
    
    if (!integration) {
      return { success: false, error: 'No active integration' };
    }
    
    const whatsappMessage = await WhatsAppMessage.create({
      integration_id: integration.id,
      campaign_id: campaignId,
      phone_number: phoneNumber,
      content: message,
      created_by: userId
    });
    
    const sendResult = await sendMessageThroughProvider(integration, whatsappMessage);
    
    await whatsappMessage.update({
      status: sendResult.success ? 'sent' : 'failed',
      provider_message_id: sendResult.message_id,
      sent_at: sendResult.success ? new Date() : null,
      error_message: sendResult.success ? null : sendResult.error,
      cost: sendResult.cost || 0
    });
    
    return sendResult;
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}