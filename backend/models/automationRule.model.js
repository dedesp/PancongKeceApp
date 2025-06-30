const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AutomationRule = sequelize.define('automation_rules', {
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
  trigger_type: {
    type: DataTypes.ENUM(
      'birthday', 
      'transaction_completed', 
      'customer_inactive', 
      'loyalty_tier_upgrade',
      'feedback_received',
      'scheduled_time',
      'customer_registered'
    ),
    allowNull: false
  },
  trigger_conditions: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Kondisi trigger dalam format JSON'
  },
  action_type: {
    type: DataTypes.ENUM(
      'send_message', 
      'add_points', 
      'create_discount', 
      'assign_segment',
      'create_task',
      'send_notification'
    ),
    allowNull: false
  },
  action_config: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Konfigurasi aksi dalam format JSON'
  },
  target_segments: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array segment IDs yang menjadi target'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  execution_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Jumlah eksekusi rule ini'
  },
  last_executed: {
    type: DataTypes.DATE,
    comment: 'Waktu terakhir rule dijalankan'
  },
  next_execution: {
    type: DataTypes.DATE,
    comment: 'Waktu eksekusi berikutnya (untuk scheduled rules)'
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

module.exports = AutomationRule;