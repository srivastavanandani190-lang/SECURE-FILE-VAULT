const sequelize = require('../config/db');
const User = require('./User');
const File = require('./File');
const Share = require('./Share');
const AuditLog = require('./AuditLog');

// Define Relations

// User -> File (Owner)
User.hasMany(File, { foreignKey: 'owner_id' });
File.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// User -> Share (SharedBy & Recipient)
User.hasMany(Share, { foreignKey: 'shared_by', as: 'sharesSent' });
Share.belongsTo(User, { foreignKey: 'shared_by', as: 'sender' });

User.hasMany(Share, { foreignKey: 'recipient_id', as: 'sharesReceived' });
Share.belongsTo(User, { foreignKey: 'recipient_id', as: 'recipient' });

// File -> Share
File.hasMany(Share, { foreignKey: 'file_id' });
Share.belongsTo(File, { foreignKey: 'file_id' });

module.exports = {
  sequelize,
  User,
  File,
  Share,
  AuditLog
};
