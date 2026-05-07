const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
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
        'refunded',
      ),
      defaultValue: 'pending',
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded'),
      defaultValue: 'pending',
      allowNull: false,
    },
    shipping_status: {
      type: DataTypes.ENUM('not_shipped', 'shipped', 'delivered', 'returned'),
      defaultValue: 'not_shipped',
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
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'VND',
      allowNull: false,
    },
    shipping_address_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'addresses',
        key: 'id',
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ordered_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('NOW'),
    },
    shipped_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'orders',
    timestamps: true,
    paranoid: true,
    indexes: [
      { unique: true, fields: ['order_number'] },
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['payment_status'] },
      { fields: ['shipping_status'] },
      { fields: ['ordered_at'] },
    ],
    hooks: {
      beforeCreate: async (order) => {
        if (!order.order_number) {
          // Tạo order number tự động
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0');
          order.order_number = `ORD-${timestamp}-${random}`;
        }
      },
    },
  },
);

// Methods
Order.prototype.calculateTotal = function () {
  this.total_amount =
    parseFloat(this.subtotal) +
    parseFloat(this.tax_amount) +
    parseFloat(this.shipping_amount) -
    parseFloat(this.discount_amount);
  return this.total_amount;
};

Order.prototype.canCancel = function () {
  return ['pending', 'confirmed'].includes(this.status);
};

Order.prototype.canShip = function () {
  return this.status === 'processing' && this.payment_status === 'paid';
};

Order.prototype.canDeliver = function () {
  return this.status === 'shipped';
};

Order.prototype.updateStatus = async function (newStatus, notes = null) {
  const oldStatus = this.status;
  this.status = newStatus;

  // Cập nhật timestamps dựa trên status
  if (newStatus === 'shipped' && !this.shipped_at) {
    this.shipped_at = new Date();
  } else if (newStatus === 'delivered' && !this.delivered_at) {
    this.delivered_at = new Date();
  }

  if (notes) {
    this.notes = (this.notes ? this.notes + '\n' : '') + notes;
  }

  await this.save();

  // Có thể trigger events hoặc notifications ở đây
  console.log(`Order ${this.order_number} status changed from ${oldStatus} to ${newStatus}`);

  return this;
};

Order.prototype.getOrderVendors = async function () {
  return await sequelize.models.OrderVendor.findAll({
    where: { order_id: this.id },
    include: [
      {
        model: sequelize.models.Vendor,
        as: 'vendor',
      },
    ],
  });
};

Order.prototype.getOrderItems = async function () {
  return await sequelize.models.OrderItem.findAll({
    where: { order_id: this.id },
    include: [
      {
        model: sequelize.models.Product,
        as: 'product',
      },
    ],
  });
};

Order.associate = (models) => {
  Order.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'RESTRICT',
  });
  Order.belongsTo(models.Address, {
    foreignKey: 'shipping_address_id',
    as: 'shippingAddress',
    onDelete: 'SET NULL',
  });
  Order.hasMany(models.OrderVendor, {
    foreignKey: 'order_id',
    as: 'orderVendors',
  });
  Order.hasMany(models.OrderItem, {
    foreignKey: 'order_id',
    as: 'orderItems',
  });
  Order.hasMany(models.Payment, {
    foreignKey: 'order_id',
    as: 'payments',
  });
};

module.exports = Order;
