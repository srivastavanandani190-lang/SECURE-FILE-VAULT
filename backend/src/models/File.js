const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const File = sequelize.define('File', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  owner_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  original_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sanitized_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  storage_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  iv: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  auth_tag: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  upload_status: {
    type: DataTypes.STRING,
    defaultValue: 'COMPLETED' // or 'PENDING', 'FAILED'
  }
}, {
  tableName: 'Files',
  timestamps: false
});

module.exports = File;
