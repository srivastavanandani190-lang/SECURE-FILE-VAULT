const { AuditLog, User } = require('../models');

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    res.json({ logs });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };
