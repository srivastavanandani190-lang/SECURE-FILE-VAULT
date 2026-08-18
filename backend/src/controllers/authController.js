const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { hashString, compareHash } = require('../services/cryptoService');
const logger = require('../services/auditService');
const { JWT_SECRET } = require('../config/env');

const register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    console.log(`[AUTH DEBUG] Attempting registration for email: ${email}, role: ${role}`);

    if (!['Student', 'Professor'].includes(role)) {
      console.log(`[AUTH DEBUG] Registration failed: Invalid role provided (${role})`);
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    console.log(`[AUTH DEBUG] Checking if email ${email} already exists in database...`);
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log(`[AUTH DEBUG] Registration failed: Email ${email} already exists`);
      return res.status(409).json({ message: 'User already exists' });
    }

    console.log(`[AUTH DEBUG] Hashing password and creating new ${role}...`);
    const password_hash = await hashString(password);
    const user = await User.create({ email, password_hash, role });

    console.log(`[AUTH DEBUG] Registration successful for ${email}. User ID: ${user.id}`);
    logger.info('USER_REGISTERED', { userId: user.id, details: { ipAddress: req.ip } });

    res.status(201).json({ message: 'Registration successful', userId: user.id });
  } catch (error) {
    console.error(`[AUTH DEBUG] Exception caught in register controller:`, error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`[AUTH DEBUG] Attempting login for email: ${email}`);

    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log(`[AUTH DEBUG] User not found in database for email: ${email}`);
      logger.warn('LOGIN_FAILED', { details: { email, ipAddress: req.ip, reason: 'User not found' } });
      return res.status(401).json({ message: 'User not found in database' });
    }

    console.log(`[AUTH DEBUG] User found. ID: ${user.id}, Role: ${user.role}. Proceeding to bcrypt comparison.`);
    const isPasswordMatch = await compareHash(password, user.password_hash);

    if (!isPasswordMatch) {
      console.log(`[AUTH DEBUG] Password check failed for email: ${email}`);
      logger.warn('LOGIN_FAILED', { details: { email, ipAddress: req.ip, reason: 'Invalid password' } });
      return res.status(401).json({ message: 'Invalid password provided' });
    }

    console.log(`[AUTH DEBUG] Password match successful. Generating JWT.`);
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    
    logger.info('LOGIN_SUCCESS', { userId: user.id, details: { ipAddress: req.ip } });

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error(`[AUTH DEBUG] Exception caught in login controller:`, error);
    next(error);
  }
};

module.exports = { register, login };
