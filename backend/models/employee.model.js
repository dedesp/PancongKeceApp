const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Employee = sequelize.define('employees', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hire_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  salary: {
    type: DataTypes.INTEGER
  },
  phone_number: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  },
  emergency_contact: {
    type: DataTypes.STRING
  },
  birth_date: {
    type: DataTypes.DATEONLY
  },
  status: {
    type: DataTypes.ENUM('active', 'on_leave', 'terminated'),
    defaultValue: 'active'
  },
  bank_account: {
    type: DataTypes.STRING
  },
  bank_name: {
    type: DataTypes.STRING
  }
});

module.exports = Employee;