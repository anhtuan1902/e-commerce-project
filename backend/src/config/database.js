const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
});

async function connectDB() {
  let retries = 10;

  while (retries) {
    try {
      await sequelize.authenticate();
      console.log('Database connected');
      return;
    } catch (err) {
      console.log('DB retry...', err.message);
      retries--;
      await new Promise((res) => setTimeout(res, 5000));
    }
  }

  throw new Error('Cannot connect DB');
}

module.exports = { sequelize, connectDB };
