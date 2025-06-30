const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InventoryLog = sequelize.define('inventory_logs', {
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
    }
  },
  type: {
    type: DataTypes.ENUM('in', 'out', 'adjustment'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  previous_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  new_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT
  },
  reference_id: {
    type: DataTypes.STRING,
    comment: 'Reference to transaction or purchase order ID if applicable'
  },
  reference_type: {
    type: DataTypes.STRING,
    comment: 'Type of reference (transaction, purchase, etc.)'
  }
});

module.exports = InventoryLog;