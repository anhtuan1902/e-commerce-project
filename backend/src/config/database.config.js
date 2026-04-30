require('dotenv').config();

const getDbConfig = (env = process.env.NODE_ENV) => {
  const isProduction = env === 'production';
  const useSupabase = process.env.DB_DIALECT === 'supabase';

  const baseConfig = {
    migrationStorageTableName: 'sequelize_migrations',
    logging: env === 'development' ? console.log : false,
  };

  // Supabase (vẫn dùng PostgreSQL driver)
  if (useSupabase && process.env.SUPABASE_DB_URL) {
    const { URL } = require('url');
    const dbUrl = new URL(process.env.SUPABASE_DB_URL);
    
    return {
      ...baseConfig,
      dialect: 'postgres',
      host: dbUrl.hostname,
      port: dbUrl.port || 5432,
      database: dbUrl.pathname.slice(1) || 'postgres',
      username: dbUrl.username,
      password: dbUrl.password,
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    };
  }

  // Production
  if (isProduction) {
    return {
      ...baseConfig,
      username: process.env.PRO_DB_USER,
      password: process.env.PRO_DB_PASSWORD,
      database: process.env.PRO_DB_NAME,
      host: process.env.PRO_DB_HOST,
      port: process.env.PRO_DB_PORT || 5432,
      dialect: process.env.PRO_DB_DIALECT || 'postgres',
    };
  }

  // Development
  return {
    ...baseConfig,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
  };
};

module.exports = {
  development: getDbConfig('development'),
  test: {
    ...getDbConfig('test'),
    database: process.env.DB_NAME || 'marketplace_test',
  },
  production: getDbConfig('production'),
};
