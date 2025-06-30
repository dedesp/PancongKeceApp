const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('customers', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customer_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Kode unik customer (auto-generated)'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    unique: true,
    validate: {
      isNumeric: true
    }
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  birth_date: {
    type: DataTypes.DATEONLY
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    defaultValue: null
  },
  address: {
    type: DataTypes.TEXT
  },
  loyalty_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  loyalty_tier: {
    type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
    defaultValue: 'bronze'
  },
  total_spent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total pembelian dalam Rupiah'
  },
  visit_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Jumlah kunjungan'
  },
  last_visit: {
    type: DataTypes.DATE
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT
  },
  created_by: {
    type: DataTypes.UUID,
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

module.exports = Customer;