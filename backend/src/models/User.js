const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Tên không được để trống' },
        len: { args: [2, 100], msg: 'Tên phải từ 2-100 ký tự' },
      },
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: { msg: 'Email đã tồn tại' },
      validate: {
        isEmail: { msg: 'Email không hợp lệ' },
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: true, // null nếu đăng nhập bằng Google
    },

    role: {
      type: DataTypes.ENUM('admin', 'vendor', 'customer'),
      defaultValue: 'customer',
    },

    // Google OAuth2
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: { msg: 'Số điện thoại đã tồn tại' },
    },

    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Trạng thái tài khoản
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    // Token
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true, // tự tạo createdAt, updatedAt

    // Ẩn password & refreshToken mặc định
    defaultScope: {
      attributes: { exclude: ['password', 'refreshToken'] },
    },

    scopes: {
      withPassword: { attributes: {} }, // lấy tất cả khi verify login
    },

    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  },
);

// So sánh password khi đăng nhập
User.prototype.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Trả object không có thông tin nhạy cảm
User.prototype.toSafeObject = function () {
  /* eslint-disable no-unused-vars */
  const { password, refreshToken, googleId, ...safe } = this.toJSON(); // loại bỏ các trường nhạy cảm
  return safe;
};

module.exports = User;
