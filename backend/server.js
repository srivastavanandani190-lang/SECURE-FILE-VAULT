const app = require('./src/app');
const sequelize = require('./src/config/db');
const { PORT } = require('./src/config/env');

const startServer = async () => {
  try {
    // Authenticate and sync the database
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // In a real prod app, use migrations instead of sync()
    await sequelize.sync();
    console.log('Database synchronized.');

    app.listen(PORT, () => {
      console.log(`Server is running securely on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
