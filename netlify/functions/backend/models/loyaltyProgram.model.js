const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoyaltyProgram = sequelize.define('loyalty_programs', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  earn_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 1.0,
    comment: 'Poin yang didapat per Rp 1000 spent'
  },
  tier_bronze_min: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Minimal total spent untuk tier Bronze'
  },
  tier_silver_min: {
    type: DataTypes.INTEGER,
    defaultValue: 500000,
    comment: 'Minimal total spent untuk tier Silver'
  },
  tier_gold_min: {
    type: DataTypes.INTEGER,
    defaultValue: 1500000,
    comment: 'Minimal total spent untuk tier Gold'
  },
  tier_platinum_min: {
    type: DataTypes.INTEGER,
    defaultValue: 5000000,
    comment: 'Minimal total spent untuk tier Platinum'
  },
  bronze_multiplier: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.0,
    comment: 'Pengali poin untuk Bronze'
  },
  silver_multiplier: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.25,
    comment: 'Pengali poin untuk Silver'
  },
  gold_multiplier: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.5,
    comment: 'Pengali poin untuk Gold'
  },
  platinum_multiplier: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 2.0,
    comment: 'Pengali poin untuk Platinum'
  },
  redemption_rate: {
    type: DataTypes.INTEGER,
    defaultValue: 1000,
    comment: 'Berapa poin untuk Rp 1000 diskon'
  },
  min_redemption_points: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: 'Minimal poin untuk redemption'
  },
  max_redemption_percent: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    comment: 'Maksimal persentase total yang bisa di-redeem'
  },
  points_expiry_days: {
    type: DataTypes.INTEGER,
    defaultValue: 365,
    comment: 'Hari kadaluarsa poin (0 = tidak kadaluarsa)'
  },
  birthday_bonus_points: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: 'Bonus poin ulang tahun'
  },
  referral_points: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    comment: 'Poin untuk referral customer baru'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  updated_by: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  }
});

module.exports = LoyaltyProgram;