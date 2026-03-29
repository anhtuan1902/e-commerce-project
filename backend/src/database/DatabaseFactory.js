// database/DatabaseFactory.js — tạo đúng instance theo type
const MySQLDatabase = require('./MySQLDatabase');

const drivers = {
  mysql: MySQLDatabase,
};

class DatabaseFactory {
  static create(type = process.env.DB_DIALECT ?? 'mysql', config = {}) {
    const Driver = drivers[type];
    if (!Driver) {
      throw new Error(`Dialect không hỗ trợ: "${type}". Chọn: ${Object.keys(drivers).join(', ')}`);
    }
    return new Driver(config);
  }

  // Đăng ký thêm driver mới mà không sửa file này
  static register(type, DriverClass) {
    if (!(DriverClass.prototype instanceof require('./Database'))) {
      throw new Error('Driver phải kế thừa từ Database');
    }
    drivers[type] = DriverClass;
  }
}

module.exports = DatabaseFactory;
