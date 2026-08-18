const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Share = sequelize.define('Share', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  file_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  shared_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  recipient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  token_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  is_revoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'Shares',
  timestamps: false
});

module.exports = Share;
