const { Share, File, User } = require('../models');
const { generateToken, hashString, decryptBuffer } = require('../services/cryptoService');
const { readFile } = require('../services/storageService');
const logger = require('../services/auditService');
const { sendTokenEmail } = require('../utils/sendEmail');
const { Op } = require('sequelize');

const createShare = async (req, res, next) => {
  try {
    console.log('[DEBUG 1] Share request body received:', req.body);
    const { file_id, recipientId, recipientEmail, duration_hours = 24 } = req.body;

    if (!recipientId && !recipientEmail) {
      console.log('[DEBUG ERROR] Missing recipient info');
      return res.status(400).json({ message: 'Recipient ID or Email is required' });
    }

    const file = await File.findOne({ where: { id: file_id, owner_id: req.user.id } });
    console.log('[DEBUG 2] File found:', file ? file.id : 'NULL');
    if (!file) {
      return res.status(404).json({ message: 'File not found or unauthorized' });
    }

    let recipient;
    if (recipientId) {
      recipient = await User.findByPk(recipientId);
    } else {
      recipient = await User.findOne({ where: { email: recipientEmail } });
    }
    console.log('[DEBUG 3] Recipient found:', recipient ? recipient.email : 'NULL');

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const sender = await User.findByPk(req.user.id);
    const rawToken = generateToken();
    const token_hash = await hashString(rawToken);
    const expires_at = new Date(Date.now() + duration_hours * 60 * 60 * 1000);

    const share = await Share.create({
      file_id,
      shared_by: req.user.id,
      recipient_id: recipient.id,
      token_hash,
      expires_at
    });
    console.log('[DEBUG 4] Share record created in DB. Invoking sendTokenEmail...');

    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shareUrl = `${frontendBaseUrl}/share/${share.id}/${rawToken}`;
    const fileName = file.original_name || file.originalName || 'Encrypted_Asset';

    let emailSent = false;
    try {
      await sendTokenEmail({
        toEmail: recipient.email,
        shareUrl,
        token: rawToken,
        fileName,
        senderEmail: sender ? sender.email : req.user.email
      });
      emailSent = true;
      console.log('[DEBUG 5] sendTokenEmail resolved successfully');
    } catch (emailErr) {
      console.error('[DEBUG ERROR] sendTokenEmail threw an error:', emailErr);
    }

    res.status(201).json({ 
      message: 'Share created', 
      shareId: share.id,
      token: rawToken,
      emailSent,
      expires_at 
    });
  } catch (error) {
    console.error('[DEBUG CATCH ERROR]:', error);
    next(error);
  }
};

const downloadSharedFile = async (req, res, next) => {
  try {
    const { share_id, token } = req.params;

    const share = await Share.findOne({
      where: {
        id: share_id,
        recipient_id: req.user.id,
        is_revoked: false,
        expires_at: { [Op.gt]: new Date() }
      },
      include: [{ model: File }]
    });

    if (!share) {
      logger.warn('ACCESS_DENIED', { userId: req.user.id, details: { reason: 'Share invalid or expired', share_id, ipAddress: req.ip } });
      return res.status(403).json({ message: 'Access Denied: Invalid or expired share' });
    }

    // Verify token hash
    const { compareHash } = require('../services/cryptoService'); 
    const isTokenValid = await compareHash(token, share.token_hash);

    if (!isTokenValid) {
      logger.warn('ACCESS_DENIED', { userId: req.user.id, details: { file_id: share.File.id, reason: 'Invalid token', ipAddress: req.ip } });
      return res.status(403).json({ message: 'Access Denied: Invalid token' });
    }

    const file = share.File;

    // Fetch ciphertext
    const encryptedBuffer = await readFile(file.storage_path);

    let plainBuffer;
    try {
      // Decrypt
      plainBuffer = decryptBuffer(encryptedBuffer, file.iv, file.auth_tag);
    } catch (cryptoError) {
      logger.error('SEVERE_SECURITY_ERROR', { 
        userId: req.user.id, 
        details: { 
          file_id: file.id, 
          reason: 'Auth Tag validation failed. File may have been tampered with.', 
          error: cryptoError.message,
          ipAddress: req.ip 
        } 
      });
      return res.status(500).json({ message: 'Decryption failed: Integrity check failed.' });
    }

    logger.info('FILE_ACCESSED', { userId: req.user.id, details: { file_id: file.id, ipAddress: req.ip } });

    const downloadFileName = file.original_name || file.originalName || 'secure_file';
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(plainBuffer);

  } catch (error) {
    next(error);
  }
};

const getSharedWithMe = async (req, res, next) => {
  try {
    const shares = await Share.findAll({
      where: {
        recipient_id: req.user.id,
        is_revoked: false
      },
      include: [
        {
          model: File,
          attributes: ['original_name', 'sanitized_name', 'size', 'upload_status']
        },
        {
          model: User,
          as: 'sender',
          attributes: ['email']
        }
      ],
      order: [['expires_at', 'DESC']]
    });

    res.json({ shares });
  } catch (error) {
    next(error);
  }
};

module.exports = { createShare, downloadSharedFile, getSharedWithMe };