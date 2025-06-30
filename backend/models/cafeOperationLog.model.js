const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CafeOperationLog = sequelize.define('cafe_operation_logs', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  operation_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  operation_type: {
    type: DataTypes.ENUM('open', 'close'),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  opening_cash: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Kas awal hari (untuk operation open)'
  },
  closing_cash: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Kas akhir hari (untuk operation close)'
  },
  expected_cash: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Kas yang seharusnya berdasarkan transaksi'
  },
  cash_difference: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Selisih kas (closing_cash - expected_cash)'
  },
  total_transactions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Jumlah transaksi hari itu'
  },
  total_sales: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total penjualan hari itu'
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'Catatan untuk operasi (masalah, kejadian khusus, dll)'
  },
  pos_terminal: {
    type: DataTypes.STRING,
    defaultValue: 'POS-01',
    comment: 'Identifikasi terminal POS'
  }
});

module.exports = CafeOperationLog;