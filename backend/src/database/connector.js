const { Sequelize } = require('sequelize');

// ===========================================
// DATABASE PROVIDERS CONFIGURATION
// ===========================================

const PROVIDERS = {
  // PostgreSQL-based providers
  POSTGRES: 'postgres',
  AIVEN: 'aiven',
  SUPABASE: 'supabase',
  
  
  // MySQL-based providers
  MYSQL: 'mysql',

  // Local/Development
  LOCAL: 'local',
  DOCKER: 'docker',
};

const DIALECTS = {
  postgres: ['postgres', 'aiven', 'supabase', 'local', 'docker'],
  mysql: ['mysql'],
};

// ===========================================
// SSL CONFIGURATION
// ===========================================

const getSSLOptions = (provider) => {
  const sslProviders = ['aiven', 'supabase'];
  
  if (sslProviders.includes(provider)) {
    return {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    };
  }
  
  return {};
};

// ===========================================
// PORT MAPPING
// ===========================================

const DEFAULT_PORTS = {
  postgres: 5432,
  mysql: 3306,
};

const getDialect = (provider) => {
  const dialect = DIALECTS.postgres.includes(provider) ? 'postgres' : 'mysql';
  return dialect;
};

// ===========================================
// CONNECTION STRING PARSING
// ===========================================

const parseConnectionUri = (uri) => {
  try {
    const url = new URL(uri);
    return {
      name: url.pathname.slice(1) || url.searchParams.get('dbname') || 'postgres',
      username: url.username,
      password: url.password,
      host: url.hostname,
      port: url.port || DEFAULT_PORTS[url.protocol.replace(':', '')] || 5432,
      protocol: url.protocol.replace(':', ''),
    };
  } catch (err) {
    throw new Error(`Invalid connection URI: ${uri} - ${err.message}`);
  }
};

// ===========================================
// PROVIDER CONFIGS
// ===========================================

const getProviderConfig = (provider, env) => {
  const configs = {
    // === AIVEN CLOUD ===
    aiven: () => ({
      uri: env.SERVICE_URI_POSTGRES,
      ssl: true,
    }),

    // === SUPABASE ===
    supabase: () => ({
      uri: env.SUPABASE_DB_URL,
      ssl: true,
    }),

    // === LOCAL/DOCKER ===
    local: () => ({
      name: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      host: env.DB_HOST,
      port: env.DB_PORT || DEFAULT_PORTS[env.DB_DIALECT] || 5432,
      ssl: false,
    }),
    docker: () => ({
      name: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      host: env.DB_HOST,
      port: env.DB_PORT || DEFAULT_PORTS[env.DB_DIALECT] || 5432,
      ssl: false,
    }),

    // === STANDARD POSTGRES ===
    postgres: () => ({
      name: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      host: env.DB_HOST,
      port: env.DB_PORT || 5432,
      ssl: env.DB_SSL === 'true',
    }),

    // === STANDARD MYSQL ===
    mysql: () => ({
      name: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      host: env.DB_HOST,
      port: env.DB_PORT || 3306,
      ssl: env.DB_SSL === 'true',
    }),
  };

  const configFn = configs[provider];
  if (!configFn) {
    throw new Error(`Unknown provider "${provider}". Available: ${Object.keys(PROVIDERS).join(', ')}`);
  }

  return configFn();
};

// ===========================================
// MAIN FACTORY FUNCTION
// ===========================================

const createSequelize = () => {
  const provider = process.env.DB_PROVIDER || process.env.DB_DIALECT || 'postgres';
  const dialect = getDialect(provider);
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Build config from provider
  const providerConfig = getProviderConfig(provider, process.env);

  // Base config
  const baseConfig = {
    dialect,
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
    dialectOptions: getSSLOptions(provider),
  };
  
  // Connection via URI (most providers)
  if (providerConfig.uri) {
    const parsed = parseConnectionUri(providerConfig.uri);
    console.log(`[DB] Connecting to: ${parsed.host}:${parsed.port}/${parsed.name}`);
    
    return new Sequelize(providerConfig.uri, {
      ...baseConfig,
      dialectOptions: {
        ...baseConfig.dialectOptions,
        ...(providerConfig.ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {}),
      },
    });
  }
  
  return new Sequelize(
    providerConfig.name,
    providerConfig.user,
    providerConfig.password,
    {
      ...baseConfig,
      host: providerConfig.host,
      port: providerConfig.port,
    },
  );
};

module.exports = createSequelize;
module.exports.PROVIDERS = PROVIDERS;
