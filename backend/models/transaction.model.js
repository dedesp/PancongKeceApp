const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('transactions', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transaction_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  transaction_date: {
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
  payment_method_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'payment_methods',
      key: 'id'
    }
  },
  total_amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  tax_amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Jumlah pajak (PPN)'
  },
  service_amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Jumlah service charge'
  },
  discount_amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total diskon yang diterapkan'
  },
  discount_details: {
    type: DataTypes.JSONB,
    defaultValue: null,
    comment: 'Detail diskon yang diterapkan'
  },
  rounding_amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Jumlah pembulatan'
  },
  final_amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  paid_amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Jumlah uang yang dibayarkan customer'
  },
  change_amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Jumlah kembalian yang diberikan'
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT
  },
  customer_name: {
    type: DataTypes.STRING
  },
  receipt_printed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  customer_id: {
    type: DataTypes.UUID,
    references: {
      model: 'customers',
      key: 'id'
    },
    comment: 'ID customer untuk loyalty program'
  },
  loyalty_points_earned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Poin loyalty yang didapat dari transaksi ini'
  },
  loyalty_points_redeemed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Poin loyalty yang digunakan'
  },
  promotion_applied: {
    type: DataTypes.JSONB,
    defaultValue: null,
    comment: 'Detail promosi yang diterapkan'
  }
});

module.exports = Transaction;