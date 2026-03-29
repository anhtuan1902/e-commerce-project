const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const PromotionProduct = sequelize.define(
  'PromotionProduct',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    promotion_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'promotions',
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
    tableName: 'promotion_products',
    timestamps: true,
    indexes: [
      { fields: ['promotion_id'] },
      { fields: ['product_id'] },
      { unique: true, fields: ['promotion_id', 'product_id'] },
    ],
  },
);

PromotionProduct.associate = (models) => {
  PromotionProduct.belongsTo(models.Promotion, {
    foreignKey: 'promotion_id',
    as: 'promotion',
    onDelete: 'CASCADE',
  });
  PromotionProduct.belongsTo(models.Product, {
    foreignKey: 'product_id',
    as: 'product',
    onDelete: 'CASCADE',
  });
};

module.exports = PromotionProduct;
