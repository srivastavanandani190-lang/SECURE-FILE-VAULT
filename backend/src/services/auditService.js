const winston = require('winston');
const Transport = require('winston-transport');
const { AuditLog } = require('../models');

// Custom Winston transport to save logs to the Database
class DatabaseTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  async log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    try {
      // info object format: { level, message, userId, details, ... }
      await AuditLog.create({
        event_type: info.message, // e.g., LOGIN_SUCCESS, LOGIN_FAILED
        user_id: info.userId || null,
        details: info.details ? JSON.stringify(info.details) : null,
      });
    } catch (err) {
      console.error('Failed to write to Audit_Logs table', err);
    }

    callback();
  }
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new DatabaseTransport()
  ]
});

module.exports = logger;
