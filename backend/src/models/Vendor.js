'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Vendor = sequelize.define(
  'Vendor',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    store_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    banner_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    business_type: {
      type: DataTypes.ENUM('individual', 'business', 'enterprise'),
      defaultValue: 'individual',
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'suspended', 'inactive'),
      defaultValue: 'pending',
      allowNull: false,
    },
    commission_rate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
      allowNull: false,
    },
  },
  {
    tableName: 'vendors',
    timestamps: true,
    paranoid: true,
  },
);

// Instance methods
Vendor.prototype.getFullAddress = function () {
  return this.address || 'No address provided';
};

Vendor.prototype.isActive = function () {
  return this.status === 'active';
};

Vendor.prototype.getTotalProducts = async function () {
  const products = await this.getProducts();
  return products.length;
};

Vendor.prototype.getAverageRating = async function () {
  const ratings = await this.getRatings();
  if (ratings.length === 0) return 0;

  const totalRating = ratings.reduce((sum, r) => sum + r.rating_value, 0);
  return totalRating / ratings.length;
};

Vendor.prototype.activate = async function () {
  this.status = 'active';
  return this.save();
};

Vendor.prototype.suspend = function () {
  this.status = 'suspended';
  return this.save();
};

Vendor.prototype.toSafeObject = function () {
  const { ...safe } = this.toJSON();
  return safe;
};

Vendor.associate = (models) => {
  Vendor.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  Vendor.hasMany(models.Product, {
    foreignKey: 'vendor_id',
    as: 'products',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  Vendor.hasMany(models.Promotion, {
    foreignKey: 'vendor_id',
    as: 'promotions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  Vendor.hasMany(models.OrderVendor, {
    foreignKey: 'vendor_id',
    as: 'orderVendors',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  Vendor.hasMany(models.Booking, {
    foreignKey: 'vendor_id',
    as: 'bookings',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  Vendor.hasMany(models.Rating, {
    foreignKey: 'vendor_id',
    as: 'ratings',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

module.exports = Vendor;
