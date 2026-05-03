const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../database/sequelize');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    paranoid: true, // soft delete

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

// So sánh password khi đăng nhập (Sequelize v3 uses Instance.prototype)
User.prototype.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Trả object không có thông tin nhạy cảm của user và thêm trường is_google nếu có googleId
User.prototype.toSafeObject = function () {
  /* eslint-disable no-unused-vars */
  const { password, refreshToken, googleId, ...safe } = this.toJSON(); // loại bỏ các trường nhạy cảm

  safe.no_password = !!googleId && !password; // thêm trường isGoogle
  return safe;
};

User.associate = (models) => {
  User.hasOne(models.UserProfile, { foreignKey: 'user_id', as: 'profile' });
  User.hasMany(models.Address, { foreignKey: 'user_id', as: 'addresses' });
  User.hasOne(models.LoyaltyWallet, { foreignKey: 'user_id', as: 'wallet' });
  User.hasMany(models.LoyaltyTransaction, { foreignKey: 'user_id', as: 'loyaltyTransactions' });
  User.hasOne(models.Vendor, { foreignKey: 'user_id', as: 'vendor' });
  User.hasMany(models.Order, { foreignKey: 'user_id', as: 'orders' });
  User.hasMany(models.Rating, { foreignKey: 'user_id', as: 'ratings' });
  User.hasMany(models.Comment, { foreignKey: 'user_id', as: 'comments' });
  User.hasMany(models.Wishlist, { foreignKey: 'user_id', as: 'wishlists' });
  User.hasMany(models.Booking, { foreignKey: 'user_id', as: 'bookings' });
  User.hasMany(models.Message, { foreignKey: 'sender_id', as: 'sentMessages' });
  User.hasMany(models.Conversation, { foreignKey: 'user_id', as: 'conversations' });
};

module.exports = User;
