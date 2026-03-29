class Database {
  constructor(config = {}) {
    if (new.target === Database) {
      throw new Error('Database là abstract class, không khởi tạo trực tiếp');
    }
    this.config = config;
    this.sequelize = null;
    this.retries = config.retries ?? 10;
    this.retryDelay = config.retryDelay ?? 5000;
  }

  // Subclass phải override method này để cung cấp dialect + options riêng
  _buildSequelizeOptions() {
    throw new Error('_buildSequelizeOptions() phải được implement ở subclass');
  }

  async connect() {
    const { Sequelize } = require('sequelize');
    const { name, user, password, ...options } = this._buildSequelizeOptions();

    this.sequelize = new Sequelize(name, user, password, {
      logging: false,
      ...options,
    });

    let retries = this.retries;
    while (retries > 0) {
      try {
        await this.sequelize.authenticate();
        console.log(`[DB] Kết nối thành công (${options.dialect})`);
        return this;
      } catch (err) {
        retries--;
        console.warn(`[DB] Thử lại... còn ${retries} lần. Lỗi: ${err.message}`);
        if (retries === 0) throw new Error(`Không thể kết nối DB: ${err.message}`);
        await new Promise((res) => setTimeout(res, this.retryDelay));
      }
    }
  }

  async disconnect() {
    if (this.sequelize) {
      await this.sequelize.close();
      console.log('[DB] Đã ngắt kết nối');
    }
  }

  getSequelize() {
    if (!this.sequelize) throw new Error('Chưa gọi connect()');
    return this.sequelize;
  }
}

module.exports = Database;
