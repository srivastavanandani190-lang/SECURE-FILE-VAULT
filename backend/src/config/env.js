require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/secure_vault',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_for_dev_only',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '12345678901234567890123456789012', // 32 bytes for AES-256
};
