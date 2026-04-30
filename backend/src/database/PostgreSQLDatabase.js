const Database = require('./Database');

class PostgreSQLDatabase extends Database {
  _buildSequelizeOptions() {
    const useSupabase = this.config.useSupabase || process.env.DB_DIALECT === 'supabase';

    if (useSupabase && process.env.SUPABASE_DB_URL) {
      const { URL } = require('url');
      const dbUrl = new URL(process.env.SUPABASE_DB_URL);
      
      return {
        name: dbUrl.pathname.slice(1) || 'postgres',
        user: dbUrl.username,
        password: dbUrl.password,
        host: dbUrl.hostname,
        port: dbUrl.port || 5432,
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      };
    }

    return {
      name: this.config.name ?? process.env.DB_NAME,
      user: this.config.user ?? process.env.DB_USER,
      password: this.config.password ?? process.env.DB_PASSWORD,
      host: this.config.host ?? process.env.DB_HOST,
      port: this.config.port ?? process.env.DB_PORT ?? 5432,
      dialect: 'postgres',
      dialectOptions: {
        ssl:
          process.env.DB_SSL === 'true'
            ? {
                rejectUnauthorized: false,
              }
            : false,
      },
    };
  }
}

module.exports = PostgreSQLDatabase;
