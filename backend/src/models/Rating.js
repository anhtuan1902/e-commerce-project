const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Rating = sequelize.define(
  'Rating',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_verified_purchase: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    helpful_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
  },
  {
    tableName: 'ratings',
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['product_id'] },
      { fields: ['order_id'] },
      { fields: ['rating'] },
      { fields: ['status'] },
      { unique: true, fields: ['user_id', 'product_id'] },
    ],
  },
);

// Methods
Rating.prototype.markHelpful = async function () {
  this.helpful_count += 1;
  await this.save();
  return this;
};

Rating.prototype.approve = async function () {
  this.status = 'approved';
  await this.save();
  return this;
};

Rating.prototype.reject = async function () {
  this.status = 'rejected';
  await this.save();
  return this;
};

Rating.associate = (models) => {
  Rating.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
  });
  Rating.belongsTo(models.Product, {
    foreignKey: 'product_id',
    as: 'product',
    onDelete: 'CASCADE',
  });
  Rating.belongsTo(models.Order, {
    foreignKey: 'order_id',
    as: 'order',
    onDelete: 'SET NULL',
  });
  Rating.hasMany(models.Comment, {
    foreignKey: 'rating_id',
    as: 'comments',
  });
};

module.exports = Rating;
