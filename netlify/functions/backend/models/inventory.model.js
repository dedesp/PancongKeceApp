const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inventory = sequelize.define('inventory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    unique: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  min_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'pcs'
  },
  last_restock_date: {
    type: DataTypes.DATE
  },
  last_stock_take_date: {
    type: DataTypes.DATE
  },
  last_updated_by: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  }
});

module.exports = Inventory;