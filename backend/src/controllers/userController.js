const { User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

const getProfessors = async (req, res, next) => {
  try {
    const professors = await User.findAll({
      where: { role: 'Professor' },
      attributes: ['id', 'email', 'role']
    });
    console.log(`[API DEBUG] Fetched ${professors.length} professors:`, JSON.stringify(professors));
    res.json(professors);
  } catch (error) {
    console.error(`[API DEBUG] Error fetching professors:`, error);
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: { 
        id: { [Op.ne]: req.user.id } 
      },
      attributes: ['id', 'email', 'role']
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfessors, getAllUsers };
