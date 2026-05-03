require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const provider = process.env.DB_PROVIDER || process.env.DB_DIALECT || 'postgres';

const baseConfig = {
  logging: isProduction ? false : console.log,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: false,
    timestamps: true,
  },
  migrationStorageTableName: 'sequelize_migrations',
};

const getProviderConfig = (env = process.env) => {
  const configs = {
    // === AIVEN CLOUD ===
    aiven: () => ({
      url: env.SERVICE_URI_POSTGRES,
      ssl: true,
    }),

    // === SUPABASE ===
    supabase: () => ({
      url: env.SUPABASE_DB_URL,
      ssl: true,
    }),

    // === LOCAL/DOCKER ===
    local: () => ({
      username: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      host: env.DB_HOST,
      port: env.DB_PORT || 5432,
      ssl: false,
    }),
    docker: () => ({
      username: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      host: env.DB_HOST,
      port: env.DB_PORT || 5432,
      ssl: false,
    }),

    // === STANDARD POSTGRES ===
    postgres: () => ({
      username: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      host: env.DB_HOST,
      port: env.DB_PORT || 5432,
      ssl: env.DB_SSL === 'true',
    }),

    // === STANDARD MYSQL ===
    mysql: () => ({
      username: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      host: env.DB_HOST,
      port: env.DB_PORT || 3306,
      ssl: env.DB_SSL === 'true',
      dialect: 'mysql',
    }),

    // === PRODUCTION ===
    production: () => ({
      username: env.PRO_DB_USER,
      password: env.PRO_DB_PASSWORD,
      database: env.PRO_DB_NAME,
      host: env.PRO_DB_HOST,
      port: env.PRO_DB_PORT || 5432,
      ssl: true,
    }),
  };

  const configFn = configs[provider];
  if (!configFn) {
    return configs.postgres();
  }
  return configFn();
};

const buildConfig = (env = process.env) => {
  const providerConfig = getProviderConfig(env);
  const dialect = providerConfig.dialect || (provider === 'mysql' ? 'mysql' : 'postgres');

  return {
    ...baseConfig,
    username: providerConfig.username,
    password: providerConfig.password,
    database: providerConfig.database,
    host: providerConfig.host,
    port: providerConfig.port || 5432,
    dialect,
    dialectOptions: providerConfig.ssl ? {
      ssl: { require: true, rejectUnauthorized: false },
    } : {},
  };
};

module.exports = {
  development: buildConfig(),
  test: buildConfig({
    ...process.env,
    DB_NAME: process.env.DB_NAME || 'marketplace_test',
    DB_HOST: process.env.DB_HOST || 'localhost',
  }),
  production: buildConfig({
    DB_USER: process.env.PRO_DB_USER,
    DB_PASSWORD: process.env.PRO_DB_PASSWORD,
    DB_NAME: process.env.PRO_DB_NAME,
    DB_HOST: process.env.PRO_DB_HOST,
    DB_PORT: process.env.PRO_DB_PORT,
    DB_DIALECT: process.env.PRO_DB_DIALECT,
    DB_SSL: 'true',
  }),
};
