const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WhatsAppMessage = sequelize.define('whatsapp_messages', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  integration_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'whatsapp_integrations',
      key: 'id'
    }
  },
  customer_id: {
    type: DataTypes.UUID,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  campaign_id: {
    type: DataTypes.UUID,
    references: {
      model: 'marketing_campaigns',
      key: 'id'
    }
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message_type: {
    type: DataTypes.ENUM('text', 'template', 'media', 'document', 'location'),
    defaultValue: 'text'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  media_url: {
    type: DataTypes.STRING,
    comment: 'URL for media messages'
  },
  template_name: {
    type: DataTypes.STRING,
    comment: 'WhatsApp template name'
  },
  template_params: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Template parameters'
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered', 'read', 'failed'),
    defaultValue: 'pending'
  },
  provider_message_id: {
    type: DataTypes.STRING,
    comment: 'Message ID from WhatsApp provider'
  },
  error_message: {
    type: DataTypes.TEXT,
    comment: 'Error message if failed'
  },
  sent_at: {
    type: DataTypes.DATE
  },
  delivered_at: {
    type: DataTypes.DATE
  },
  read_at: {
    type: DataTypes.DATE
  },
  reply_to: {
    type: DataTypes.UUID,
    references: {
      model: 'whatsapp_messages',
      key: 'id'
    },
    comment: 'ID of message being replied to'
  },
  direction: {
    type: DataTypes.ENUM('outbound', 'inbound'),
    defaultValue: 'outbound'
  },
  cost: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0,
    comment: 'Cost in Rupiah for sending message'
  },
  created_by: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  }
});

module.exports = WhatsAppMessage;