const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Booking = sequelize.define(
  'Booking',
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
    vendor_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'vendors',
        key: 'id',
      },
    },
    service_type: {
      type: DataTypes.ENUM('consultation', 'custom_order', 'support', 'other'),
      defaultValue: 'consultation',
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Tiêu đề đặt lịch không được để trống' },
        len: { args: [2, 255], msg: 'Tiêu đề phải từ 2-255 ký tự' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    scheduled_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfter: new Date().toISOString(),
      },
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 15,
        max: 480, // 8 hours max
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'VND',
      allowNull: false,
    },
  },
  {
    tableName: 'bookings',
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['vendor_id'] },
      { fields: ['service_type'] },
      { fields: ['scheduled_date'] },
      { fields: ['status'] },
    ],
  },
);

// Methods
Booking.prototype.confirm = async function () {
  if (this.status !== 'pending') {
    throw new Error('Chỉ có thể xác nhận booking ở trạng thái pending');
  }
  this.status = 'confirmed';
  await this.save();
  return this;
};

Booking.prototype.start = async function () {
  if (this.status !== 'confirmed') {
    throw new Error('Chỉ có thể bắt đầu booking đã được xác nhận');
  }
  this.status = 'in_progress';
  await this.save();
  return this;
};

Booking.prototype.complete = async function () {
  if (this.status !== 'in_progress') {
    throw new Error('Chỉ có thể hoàn thành booking đang tiến hành');
  }
  this.status = 'completed';
  await this.save();
  return this;
};

Booking.prototype.cancel = async function () {
  if (['completed', 'cancelled'].includes(this.status)) {
    throw new Error('Không thể hủy booking đã hoàn thành hoặc đã hủy');
  }
  this.status = 'cancelled';
  await this.save();
  return this;
};

Booking.prototype.canReschedule = function () {
  return ['pending', 'confirmed'].includes(this.status);
};

Booking.associate = (models) => {
  Booking.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
  });
  Booking.belongsTo(models.Vendor, {
    foreignKey: 'vendor_id',
    as: 'vendor',
    onDelete: 'CASCADE',
  });
};

module.exports = Booking;
