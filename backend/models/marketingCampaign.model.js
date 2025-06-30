const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MarketingCampaign = sequelize.define('marketing_campaigns', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.ENUM('email', 'whatsapp', 'sms', 'push_notification', 'in_app'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled'),
    defaultValue: 'draft'
  },
  target_segments: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of segment IDs'
  },
  target_customers: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of specific customer IDs'
  },
  message_template: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    comment: 'Subject for email campaigns'
  },
  media_url: {
    type: DataTypes.STRING,
    comment: 'URL for images or attachments'
  },
  call_to_action: {
    type: DataTypes.JSONB,
    comment: 'CTA button configuration'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE
  },
  sent_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  delivered_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  opened_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clicked_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  conversion_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  budget: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Budget dalam Rupiah'
  },
  spent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Budget yang sudah terpakai'
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

module.exports = MarketingCampaign;