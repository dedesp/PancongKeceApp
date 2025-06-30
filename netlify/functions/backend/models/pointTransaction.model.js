const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PointTransaction = sequelize.define('point_transactions', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  transaction_id: {
    type: DataTypes.UUID,
    references: {
      model: 'transactions',
      key: 'id'
    },
    comment: 'Reference ke transaction jika dari pembelian'
  },
  type: {
    type: DataTypes.ENUM('earn', 'redeem', 'bonus', 'expire', 'adjustment'),
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Positif untuk earn/bonus, negatif untuk redeem/expire'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  purchase_amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Jumlah pembelian jika dari transaksi'
  },
  points_balance_before: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Saldo poin sebelum transaksi'
  },
  points_balance_after: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Saldo poin setelah transaksi'
  },
  expires_at: {
    type: DataTypes.DATE,
    comment: 'Tanggal kadaluarsa poin (untuk type earn)'
  },
  is_expired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  processed_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT
  }
});

module.exports = PointTransaction;