const nodemailer = require('nodemailer');
const config = require('../config/env'); // Adjust path to match your config file location

const sendTokenEmail = async ({ toEmail, shareUrl, token, fileName, senderEmail }) => {
  // Ensure port is cast to a number
  const port = Number(config.SMTP_PORT) || 587;
  const isSecure = port === 465;

  const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSecure, // true for 465, false for 587
    auth: {
      user: config.SMTP_USER,
      // Remove whitespace if app password was pasted with spaces
      pass: config.SMTP_PASS ? config.SMTP_PASS.replace(/\s+/g, '') : '',
    },
  });

  const htmlContent = `
    <div style="font-family: monospace; background-color: #050505; color: #f8fafc; padding: 24px; border: 1px solid #1e222e;">
      <h2 style="color: #10b981; margin-bottom: 8px; font-size: 16px;">[SECURE VAULT] SHARED FILE PAYLOAD</h2>
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 16px;">
        Sender <strong style="color: #f8fafc;">${senderEmail}</strong> has authorized access to an encrypted asset.
      </p>
      
      <div style="background-color: #0d0e12; border: 1px solid #1e222e; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">FILE NAME:</p>
        <p style="margin: 4px 0 12px 0; font-size: 13px; color: #f8fafc;"><strong>${fileName}</strong></p>
        
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">DECRYPTION TOKEN:</p>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #10b981; font-weight: bold; letter-spacing: 1px;">${token}</p>
      </div>

      <a href="${shareUrl}" style="display: inline-block; background-color: #10b981; color: #050505; padding: 10px 18px; text-decoration: none; font-weight: bold; font-size: 12px; font-family: monospace;">ACCESS SECURE FILE</a>

      <p style="font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #1e222e; padding-top: 12px;">
        Time-restricted cryptographic link. Do not share or forward this token.
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Secure File Vault" <${config.SMTP_USER}>`,
      to: toEmail,
      subject: `[SECURE VAULT] Shared File Token: ${fileName}`,
      html: htmlContent,
    });

    console.log(`[SMTP SUCCESS] Token email sent to ${toEmail}. MessageID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[SMTP ERROR] Failed to send token email to ${toEmail}:`, error.message);
    throw error;
  }
};

module.exports = { sendTokenEmail };