const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { ENCRYPTION_KEY } = require('../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt a buffer using AES-256-GCM
 * @param {Buffer} buffer - The plain text buffer to encrypt
 * @returns {Object} { encryptedBuffer, iv, authTag }
 */
const encryptBuffer = (buffer) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);

  const encryptedBuffer = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedBuffer,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

/**
 * Decrypt a buffer using AES-256-GCM
 * @param {Buffer} encryptedBuffer - The ciphertext buffer
 * @param {string} ivHex - The initialization vector as a hex string
 * @param {string} authTagHex - The auth tag as a hex string
 * @returns {Buffer} The decrypted plain text buffer
 */
const decryptBuffer = (encryptedBuffer, ivHex, authTagHex) => {
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
};

/**
 * Generate a secure random hex token
 * @param {number} bytes - Length of random bytes
 * @returns {string} Hex token
 */
const generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash a password or token
 * @param {string} plaintext - The plain string to hash
 * @returns {Promise<string>} The bcrypt hash
 */
const hashString = async (plaintext) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plaintext, salt);
};

/**
 * Compare plain string with hash
 * @param {string} plaintext 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
const compareHash = async (plaintext, hash) => {
  return bcrypt.compare(plaintext, hash);
};

/**
 * Create a SHA-256 hash for file integrity
 * @param {Buffer} buffer 
 * @returns {string}
 */
const generateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

module.exports = {
  encryptBuffer,
  decryptBuffer,
  generateToken,
  hashString,
  compareHash,
  generateFileHash
};
