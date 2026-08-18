const multer = require('multer');

// 1. Store files strictly in memory buffer (Plaintext must NOT touch disk)
const storage = multer.memoryStorage();

// 2. Validate MIME type
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/zip'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PNG, JPG, DOCX, ZIP allowed.'), false);
  }
};

// Limit size to 25MB
const limits = {
  fileSize: 25 * 1024 * 1024
};

const upload = multer({
  storage,
  fileFilter,
  limits
});

// Middleware to sanitize filename after multer parses it
const sanitizeFilename = (req, res, next) => {
  if (req.file) {
    // Prevent path traversal by stripping directory paths and keeping alphanumeric
    req.file.sanitizedName = req.file.originalname.replace(/^.*[\\\/]/, '').replace(/[^a-zA-Z0-9.\-_]/g, '_');
  }
  next();
};

module.exports = {
  upload: upload.single('file'),
  sanitizeFilename
};
