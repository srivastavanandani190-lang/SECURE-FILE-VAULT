const { Sequelize } = require('sequelize');

// Fallback to SQLite so the app can run without PostgreSQL being installed
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

module.exports = sequelize;
