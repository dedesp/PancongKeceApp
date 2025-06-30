const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaxSetting = sequelize.define('tax_settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  setting_key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  setting_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT
  },
  apply_before_service: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'True jika pajak dihitung sebelum service charge'
  },
  updated_by: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  }
});

module.exports = TaxSetting;