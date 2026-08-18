const express = require('express');
const { getAuditLogs } = require('../controllers/auditController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);
// Only Professor (or Admin) can view audit logs
router.use(requireRole(['Professor']));

router.get('/logs', getAuditLogs);

module.exports = router;
