const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CustomerSegment = sequelize.define('customer_segments', {
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
  criteria: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Kriteria segmentasi dalam format JSON'
  },
  target_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Estimasi jumlah customer yang masuk segmen'
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#4a7c59',
    comment: 'Warna untuk identifikasi segmen'
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

module.exports = CustomerSegment;