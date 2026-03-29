const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Wishlist = sequelize.define(
  'Wishlist',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    product_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
  },
  {
    tableName: 'wishlists',
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['product_id'] },
      { unique: true, fields: ['user_id', 'product_id'] },
    ],
  },
);

Wishlist.associate = (models) => {
  Wishlist.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
  });
  Wishlist.belongsTo(models.Product, {
    foreignKey: 'product_id',
    as: 'product',
    onDelete: 'CASCADE',
  });
};

module.exports = Wishlist;
