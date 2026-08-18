const express = require('express');
const { createShare, downloadSharedFile, getSharedWithMe } = require('../controllers/shareController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.post('/create', createShare);
router.get('/shared-with-me', getSharedWithMe);
router.get('/download/:share_id/:token', downloadSharedFile);

module.exports = router;
