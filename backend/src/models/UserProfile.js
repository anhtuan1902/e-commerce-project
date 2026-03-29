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
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
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

module.exports = UserProfile;
