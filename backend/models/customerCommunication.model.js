const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CustomerCommunication = sequelize.define('customer_communications', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
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
  type: {
    type: DataTypes.ENUM('email', 'whatsapp', 'sms', 'phone_call', 'in_person', 'note'),
    allowNull: false
  },
  direction: {
    type: DataTypes.ENUM('outbound', 'inbound'),
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'read', 'replied', 'failed'),
    defaultValue: 'sent'
  },
  scheduled_at: {
    type: DataTypes.DATE
  },
  sent_at: {
    type: DataTypes.DATE
  },
  read_at: {
    type: DataTypes.DATE
  },
  replied_at: {
    type: DataTypes.DATE
  },
  media_urls: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of media file URLs'
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of tags for categorization'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  follow_up_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  follow_up_date: {
    type: DataTypes.DATE
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
});

module.exports = CustomerCommunication;