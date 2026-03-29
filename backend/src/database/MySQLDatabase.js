const Database = require('./Database');


class MySQLDatabase extends Database {
  _buildSequelizeOptions() {
    return {
      name: this.config.name ?? process.env.DB_NAME,
      user: this.config.user ?? process.env.DB_USER,
      password: this.config.password ?? process.env.DB_PASSWORD,
      host: this.config.host ?? process.env.DB_HOST,
      port: this.config.port ?? process.env.DB_PORT ?? 3306,
      dialect: 'mysql',
    };
  }
}

module.exports = MySQLDatabase;
