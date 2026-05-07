const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Payment = sequelize.define(
  'Payment',
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
    payment_method: {
      type: DataTypes.ENUM(
        'credit_card',
        'debit_card',
        'paypal',
        'bank_transfer',
        'cash_on_delivery',
        'digital_wallet',
        'loyalty_points',
      ),
      allowNull: false,
    },
    payment_gateway: {
      type: DataTypes.ENUM('cod', 'stripe', 'paypal', 'vnpay', 'momo', 'zalopay', 'manual'),
      allowNull: true,
    },
    transaction_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'VND',
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'),
      defaultValue: 'pending',
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failure_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gateway_response: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    refunded_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      allowNull: false,
    },
    refund_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'payments',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['order_id'] },
      { unique: true, fields: ['transaction_id'] },
      { fields: ['status'] },
      { fields: ['payment_date'] },
    ],
    hooks: {
      beforeUpdate: async (payment) => {
        if (payment.changed('status') && payment.status === 'completed' && !payment.payment_date) {
          payment.payment_date = new Date();
        }
      },
    },
  },
);

// Methods
Payment.prototype.isSuccessful = function () {
  return this.status === 'completed';
};

Payment.prototype.canRefund = function () {
  return this.status === 'completed' && parseFloat(this.refunded_amount) < parseFloat(this.amount);
};

Payment.prototype.getRefundableAmount = function () {
  return parseFloat(this.amount) - parseFloat(this.refunded_amount);
};

Payment.prototype.processRefund = async function (amount, reason) {
  if (!this.canRefund()) {
    throw new Error('Payment cannot be refunded');
  }

  if (amount > this.getRefundableAmount()) {
    throw new Error('Refund amount exceeds refundable amount');
  }

  this.refunded_amount = parseFloat(this.refunded_amount) + amount;
  this.refund_reason = reason;

  if (this.refunded_amount >= this.amount) {
    this.status = 'refunded';
  }

  await this.save();
  return this;
};

Payment.prototype.updateStatus = async function (
  newStatus,
  failureReason = null,
  gatewayResponse = null,
) {
  this.status = newStatus;

  if (failureReason) {
    this.failure_reason = failureReason;
  }

  if (gatewayResponse) {
    this.gateway_response = gatewayResponse;
  }

  await this.save();
  return this;
};

Payment.associate = (models) => {
  Payment.belongsTo(models.Order, {
    foreignKey: 'order_id',
    as: 'order',
    onDelete: 'CASCADE',
  });
};

module.exports = Payment;
