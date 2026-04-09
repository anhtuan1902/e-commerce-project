const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    order_vendor_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'order_vendor',
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
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    product_sku: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    attributes: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: 'order_items',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['order_id'] },
      { fields: ['order_vendor_id'] },
      { fields: ['product_id'] },
    ],
    hooks: {
      beforeSave: async (item) => {
        // Tự động tính total_price
        item.total_price =
          parseFloat(item.unit_price) * item.quantity -
          parseFloat(item.discount_amount) +
          parseFloat(item.tax_amount);
      },
    },
  },
);

// Methods
OrderItem.prototype.getSubtotal = function () {
  return parseFloat(this.unit_price) * this.quantity;
};

OrderItem.prototype.getFinalPrice = function () {
  return parseFloat(this.total_price);
};

OrderItem.associate = (models) => {
  OrderItem.belongsTo(models.Order, {
    foreignKey: 'order_id',
    as: 'order',
    onDelete: 'CASCADE',
  });
  OrderItem.belongsTo(models.OrderVendor, {
    foreignKey: 'order_vendor_id',
    as: 'orderVendor',
    onDelete: 'CASCADE',
  });
  OrderItem.belongsTo(models.Product, {
    foreignKey: 'product_id',
    as: 'product',
    onDelete: 'RESTRICT',
  });
};

module.exports = OrderItem;
