const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RoundingSetting = sequelize.define('rounding_settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Aktifkan pembulatan'
  },
  rounding_method: {
    type: DataTypes.ENUM('up', 'down', 'nearest'),
    defaultValue: 'nearest',
    comment: 'Metode pembulatan: up (ke atas), down (ke bawah), nearest (terdekat)'
  },
  rounding_increment: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    validate: {
      isIn: [[1, 5, 10, 25, 50, 100, 500, 1000]]
    },
    comment: 'Kelipatan pembulatan dalam Rupiah'
  },
  apply_to: {
    type: DataTypes.ENUM('final_total', 'after_tax', 'after_service'),
    defaultValue: 'final_total',
    comment: 'Kapan pembulatan diterapkan'
  },
  description: {
    type: DataTypes.STRING
  },
  updated_by: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  }
});

module.exports = RoundingSetting;