const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WhatsAppIntegration = sequelize.define('whatsapp_integrations', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  provider: {
    type: DataTypes.ENUM('whatsapp_business_api', 'twilio', 'wablas', 'fonnte', 'custom'),
    allowNull: false,
    defaultValue: 'whatsapp_business_api'
  },
  api_endpoint: {
    type: DataTypes.STRING,
    allowNull: false
  },
  api_token: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Encrypted API token'
  },
  phone_number_id: {
    type: DataTypes.STRING,
    comment: 'WhatsApp Business phone number ID'
  },
  webhook_url: {
    type: DataTypes.STRING,
    comment: 'Webhook URL untuk receive messages'
  },
  webhook_token: {
    type: DataTypes.STRING,
    comment: 'Webhook verification token'
  },
  business_name: {
    type: DataTypes.STRING,
    defaultValue: 'Sajati Smart System'
  },
  default_template: {
    type: DataTypes.TEXT,
    defaultValue: 'Halo {name}, terima kasih telah berkunjung ke Sajati Smart System!'
  },
  rate_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 1000,
    comment: 'Messages per hour limit'
  },
  messages_sent_today: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_reset_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  configuration: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Provider-specific configuration'
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  updated_by: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  }
});

module.exports = WhatsAppIntegration;