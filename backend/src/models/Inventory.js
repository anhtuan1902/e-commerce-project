const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Inventory = sequelize.define(
  'Inventory',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    reserved_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    low_stock_threshold: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    track_inventory: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    backorder_allowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'inventory',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['product_id'] },
      { fields: ['quantity'] },
      { fields: ['track_inventory'] },
    ],
    hooks: {
      beforeSave: async (inventory) => {
        inventory.last_updated = new Date();
      },
    },
  },
);

// Methods
Inventory.prototype.getAvailableQuantity = function () {
  return this.quantity - this.reserved_quantity;
};

Inventory.prototype.isLowStock = function () {
  return this.track_inventory && this.quantity <= this.low_stock_threshold;
};

Inventory.prototype.isOutOfStock = function () {
  return this.track_inventory && this.quantity <= 0;
};

Inventory.prototype.reserveStock = async function (quantity) {
  if (this.getAvailableQuantity() < quantity) {
    throw new Error('Không đủ hàng trong kho để đặt trước');
  }
  this.reserved_quantity += quantity;
  await this.save();
  return this;
};

Inventory.prototype.releaseStock = async function (quantity) {
  this.reserved_quantity = Math.max(0, this.reserved_quantity - quantity);
  await this.save();
  return this;
};

Inventory.prototype.adjustStock = async function (quantity, reason = null) {
  this.quantity += quantity;
  if (reason) {
    // Có thể log lý do điều chỉnh tồn kho
    console.log(`Stock adjusted by ${quantity} for product ${this.product_id}: ${reason}`);
  }
  await this.save();
  return this;
};

Inventory.associate = (models) => {
  Inventory.belongsTo(models.Product, {
    foreignKey: 'product_id',
    as: 'product',
    onDelete: 'CASCADE',
  });
};

module.exports = Inventory;
