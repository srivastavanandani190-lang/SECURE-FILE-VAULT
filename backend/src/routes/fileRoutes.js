const express = require('express');
const { uploadFile, listFiles } = require('../controllers/fileController');
const { requireAuth } = require('../middleware/authMiddleware');
const { upload, sanitizeFilename } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(requireAuth);

router.post('/upload', upload, sanitizeFilename, uploadFile);
router.get('/', listFiles);

module.exports = router;
