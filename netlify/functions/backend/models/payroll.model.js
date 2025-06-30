const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payroll = sequelize.define('payrolls', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  employee_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  period_start: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  period_end: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  basic_salary: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  allowances: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  overtime_pay: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bonuses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  deductions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tax: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  net_salary: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  payment_date: {
    type: DataTypes.DATEONLY
  },
  payment_method: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('draft', 'approved', 'paid', 'cancelled'),
    defaultValue: 'draft'
  },
  approved_by: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT
  }
});

module.exports = Payroll;