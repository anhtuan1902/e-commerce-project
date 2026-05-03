const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const OrderVendor = sequelize.define(
  'OrderVendor',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vendors',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ),
      defaultValue: 'pending',
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    shipping_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    commission_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    tracking_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    shipping_carrier: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'order_vendor',
    timestamps: true,
    paranoid: true,
    indexes: [{ fields: ['order_id'] }, { fields: ['vendor_id'] }, { fields: ['status'] }],
  },
);

// Methods
OrderVendor.prototype.calculateTotal = function () {
  this.total_amount =
    parseFloat(this.subtotal) +
    parseFloat(this.tax_amount) +
    parseFloat(this.shipping_amount) -
    parseFloat(this.discount_amount);
  return this.total_amount;
};

OrderVendor.prototype.calculateCommission = function (commissionRate) {
  this.commission_amount = (parseFloat(this.subtotal) * commissionRate) / 100;
  return this.commission_amount;
};

OrderVendor.prototype.updateTracking = async function (trackingNumber, carrier) {
  this.tracking_number = trackingNumber;
  this.shipping_carrier = carrier;
  await this.save();
  return this;
};

OrderVendor.associate = (models) => {
  OrderVendor.belongsTo(models.Order, {
    foreignKey: 'order_id',
    as: 'order',
    onDelete: 'CASCADE',
  });
  OrderVendor.belongsTo(models.Vendor, {
    foreignKey: 'vendor_id',
    as: 'vendor',
    onDelete: 'CASCADE',
  });
  OrderVendor.hasMany(models.OrderItem, {
    foreignKey: 'order_vendor_id',
    as: 'orderItems',
  });
};

module.exports = OrderVendor;
