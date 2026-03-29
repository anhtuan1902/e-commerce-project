require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT ?? 'mysql',
    migrationStorageTableName: 'sequelize_migrations',
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT ?? 'mysql',
    migrationStorageTableName: 'sequelize_migrations',
  },
  production: {
    username: process.env.PRO_DB_USER,
    password: process.env.PRO_DB_PASSWORD,
    database: process.env.PRO_DB_NAME,
    host: process.env.PRO_DB_HOST,
    port: process.env.PRO_DB_PORT || 3306,
    dialect: process.env.PRO_DB_DIALECT ?? 'mysql',
    migrationStorageTableName: 'sequelize_migrations',
  },
};
