const MySQLDatabase = require('./MySQLDatabase');
const PostgreSQLDatabase = require('./PostgreSQLDatabase');

const drivers = {
  mysql: MySQLDatabase,
  postgres: PostgreSQLDatabase,
};

class DatabaseFactory {
  static create(type = process.env.DB_DIALECT ?? 'postgres', config = {}) {
    const normalizedType = type === 'postgresql' ? 'postgres' : type;
    
    // Nếu Supabase được chọn, vẫn dùng PostgreSQL driver nhưng với cấu hình Supabase
    if (normalizedType === 'supabase') {
      return new PostgreSQLDatabase({
        ...config,
        useSupabase: true,
      });
    }
    
    const Driver = drivers[normalizedType];
    if (!Driver) {
      throw new Error(
        `Dialect "${type}" không được hỗ trợ. Chọn: ${Object.keys(drivers).join(', ')}`,
      );
    }
    return new Driver(config);
  }

  static register(type, DriverClass) {
    if (!(DriverClass.prototype instanceof require('./Database'))) {
      throw new Error('Driver phải kế thừa từ Database');
    }
    drivers[type] = DriverClass;
  }

  static getSupportedDialects() {
    return Object.keys(drivers);
  }
}

module.exports = DatabaseFactory;
