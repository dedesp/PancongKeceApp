const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lead = sequelize.define('leads', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  company: {
    type: DataTypes.STRING
  },
  source: {
    type: DataTypes.ENUM('walk_in', 'social_media', 'referral', 'website', 'event', 'cold_call', 'advertisement'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost'),
    defaultValue: 'new'
  },
  interest_level: {
    type: DataTypes.ENUM('cold', 'warm', 'hot'),
    defaultValue: 'warm'
  },
  estimated_value: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Estimasi nilai dalam Rupiah'
  },
  probability: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Probabilitas closing dalam persen'
  },
  expected_close_date: {
    type: DataTypes.DATE
  },
  actual_close_date: {
    type: DataTypes.DATE
  },
  close_reason: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  },
  last_contact_date: {
    type: DataTypes.DATE
  },
  next_follow_up: {
    type: DataTypes.DATE
  },
  assigned_to: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  customer_id: {
    type: DataTypes.UUID,
    references: {
      model: 'customers',
      key: 'id'
    },
    comment: 'ID customer jika lead sudah menjadi customer'
  },
  referrer_customer_id: {
    type: DataTypes.UUID,
    references: {
      model: 'customers',
      key: 'id'
    },
    comment: 'ID customer yang mereferral'
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
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

module.exports = Lead;