const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const UserProfile = sequelize.define(
  'UserProfile',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Tên không được để trống' },
        len: { args: [2, 100], msg: 'Tên phải từ 2-100 ký tự' },
      },
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    avatarUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        const avatar = this.getDataValue('avatar');
        if (!avatar) return null;
        // check avatar đã có đầu vào là http chưa, nếu có rồi thì trả về luôn, chưa thì thêm APP_URL vào trước
        if (avatar.startsWith('http')) return avatar;
        return `${process.env.APP_URL}${avatar}`;
      },
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    // Thêm: gender
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true,
    },
  },
  {
    tableName: 'user_profiles',
    indexes: [{ unique: true, fields: ['user_id'] }],
  },
);

UserProfile.associate = (models) => {
  UserProfile.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
};

UserProfile.prototype.toSafeObject = function () {
  const { ...safe } = this.toJSON();
  return safe;
};

module.exports = UserProfile;
