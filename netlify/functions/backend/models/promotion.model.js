const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Promotion = sequelize.define('promotions', {
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
    type: DataTypes.ENUM('time_based', 'loyalty_tier', 'purchase_amount', 'product_specific', 'customer_birthday'),
    allowNull: false
  },
  discount_type: {
    type: DataTypes.ENUM('percentage', 'fixed_amount', 'buy_x_get_y', 'free_item'),
    allowNull: false
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  max_discount_amount: {
    type: DataTypes.INTEGER,
    comment: 'Maksimal diskon untuk percentage type'
  },
  minimum_purchase: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  applicable_to: {
    type: DataTypes.ENUM('all', 'category', 'product'),
    defaultValue: 'all'
  },
  applicable_items: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array ID kategori atau produk'
  },
  loyalty_tiers: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array tier yang berlaku (bronze, silver, gold, platinum)'
  },
  time_conditions: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Kondisi waktu: days_of_week, start_time, end_time, etc'
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  usage_limit: {
    type: DataTypes.INTEGER,
    comment: 'Total limit penggunaan'
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  per_customer_limit: {
    type: DataTypes.INTEGER,
    comment: 'Limit per customer'
  },
  requires_loyalty_member: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  auto_apply: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Otomatis diterapkan jika memenuhi syarat'
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Priority untuk auto-apply (1 = highest)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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

module.exports = Promotion;