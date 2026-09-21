const { File, Share, User } = require('../models');
const { encryptBuffer, generateFileHash, generateToken, hashString } = require('../services/cryptoService');
const { saveFile } = require('../services/storageService');
const { sendTokenEmail } = require('../utils/sendEmail');
const logger = require('../services/auditService');
const { v4: uuidv4 } = require('uuid');

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { originalname, sanitizedName, mimetype, size, buffer } = req.file;
    const { recipientId, duration } = req.body; // New fields for bi-directional sharing

    // Generate unique ID for the file record and storage name
    const fileId = uuidv4();

    // 3 & 4. Cryptographic pre-storage operations (AES-256-GCM)
    const { encryptedBuffer, iv, authTag } = encryptBuffer(buffer);

    // Save strictly the encrypted buffer to disk (/storage/vault/)
    const storagePath = await saveFile(fileId, encryptedBuffer);

    // 5. Save metadata (including IV and Auth Tag) to the Files table
    const newFile = await File.create({
      id: fileId,
      owner_id: req.user.id,
      original_name: originalname,
      sanitized_name: sanitizedName,
      size,
      storage_path: storagePath,
      iv,
      auth_tag: authTag,
      upload_status: 'COMPLETED'
    });

    logger.info('FILE_UPLOADED', { 
      userId: req.user.id, 
      details: { fileId, size, mimeType: mimetype, ipAddress: req.ip }
    });

    let shareData = null;

    // Optional: Immediately share if recipientId is provided
    if (recipientId) {
      const recipient = await User.findByPk(recipientId);
      const sender = await User.findByPk(req.user.id);

      if (recipient) {
        const rawToken = generateToken();
        const token_hash = await hashString(rawToken);
        const duration_hours = parseFloat(duration) || 24;
        const expires_at = new Date(Date.now() + duration_hours * 60 * 60 * 1000);

        const share = await Share.create({
          file_id: fileId,
          shared_by: req.user.id,
          recipient_id: recipient.id,
          token_hash,
          expires_at
        });

        // Build access URL
        const frontendBaseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
        const shareUrl = `${frontendBaseUrl}/share/${share.id}/${rawToken}`;

        // Dispatch Email Notification
        let emailSent = false;
        try {
          await sendTokenEmail({
            toEmail: recipient.email,
            shareUrl,
            token: rawToken,
            fileName: originalname || sanitizedName || 'Encrypted_Asset',
            senderEmail: sender ? sender.email : req.user.email
          });
          emailSent = true;
        } catch (emailErr) {
          logger.error('EMAIL_DISPATCH_FAILED', {
            userId: req.user.id,
            details: { share_id: share.id, recipient_id: recipient.id, error: emailErr.message }
          });
        }

        logger.info('FILE_SHARED', {
          userId: req.user.id,
          details: { file_id: fileId, recipient_id: recipient.id, duration_hours, emailSent, ipAddress: req.ip }
        });

        shareData = {
          shareId: share.id,
          token: rawToken,
          emailSent,
          expires_at
        };
      }
    }

    res.status(201).json({ 
      message: 'File uploaded securely', 
      file: { id: fileId, name: sanitizedName, size },
      share: shareData // Include share info if applicable
    });
  } catch (error) {
    next(error);
  }
};

const listFiles = async (req, res, next) => {
  try {
    const files = await File.findAll({
      where: { owner_id: req.user.id },
      attributes: ['id', 'original_name', 'sanitized_name', 'size', 'upload_status']
    });

    res.json({ files });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadFile, listFiles };