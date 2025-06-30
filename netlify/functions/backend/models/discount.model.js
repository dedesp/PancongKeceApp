const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Discount = sequelize.define('discounts', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.ENUM('percentage', 'fixed_amount', 'buy_x_get_y', 'minimum_purchase'),
    allowNull: false,
    defaultValue: 'percentage'
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  max_discount_amount: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    comment: 'Maksimal potongan untuk diskon persentase'
  },
  minimum_purchase: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Minimal pembelian untuk mendapat diskon'
  },
  buy_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Jumlah item yang harus dibeli untuk buy X get Y'
  },
  get_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Jumlah item gratis untuk buy X get Y'
  },
  applicable_to: {
    type: DataTypes.ENUM('all', 'category', 'product'),
    defaultValue: 'all',
    comment: 'Berlaku untuk semua, kategori tertentu, atau produk tertentu'
  },
  applicable_items: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array ID kategori atau produk yang berlaku'
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
    defaultValue: null,
    comment: 'Batas penggunaan total (null = unlimited)'
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Jumlah yang sudah digunakan'
  },
  per_customer_limit: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    comment: 'Batas penggunaan per customer'
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

module.exports = Discount;