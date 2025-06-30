const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('attendances', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  clock_in: {
    type: DataTypes.TIME
  },
  clock_out: {
    type: DataTypes.TIME
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'half_day', 'leave'),
    defaultValue: 'present'
  },
  notes: {
    type: DataTypes.TEXT
  },
  approved_by: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  working_hours: {
    type: DataTypes.DECIMAL(4, 2)
  }
});

module.exports = Attendance;