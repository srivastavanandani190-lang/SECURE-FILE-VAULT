require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET ,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY , // 32 bytes for AES-256
  SMTP_HOST: process.env.SMTP_HOST ,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER ,
  SMTP_PASS: process.env.SMTP_PASS,
  FRONTEND_URL: process.env.FRONTEND_URL
};