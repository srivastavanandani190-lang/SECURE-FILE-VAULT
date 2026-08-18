const fs = require('fs').promises;
const path = require('path');

const VAULT_DIR = path.resolve(__dirname, '../../storage/vault');

/**
 * Save encrypted buffer to vault
 * @param {string} fileId - The unique ID for the file to use as filename
 * @param {Buffer} encryptedBuffer - The ciphertext buffer
 * @returns {Promise<string>} The storage path
 */
const saveFile = async (fileId, encryptedBuffer) => {
  const filePath = path.join(VAULT_DIR, `${fileId}.enc`);
  
  // Ensure directory exists
  try {
    await fs.mkdir(VAULT_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }

  await fs.writeFile(filePath, encryptedBuffer);
  return filePath;
};

/**
 * Read encrypted buffer from vault
 * @param {string} storagePath - Path to the `.enc` file
 * @returns {Promise<Buffer>} The ciphertext buffer
 */
const readFile = async (storagePath) => {
  return fs.readFile(storagePath);
};

module.exports = {
  saveFile,
  readFile
};
