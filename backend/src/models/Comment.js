const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Comment = sequelize.define(
  'Comment',
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
    rating_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'ratings',
        key: 'id',
      },
    },
    parent_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nội dung bình luận không được để trống' },
        len: { args: [1, 2000], msg: 'Nội dung bình luận không được vượt quá 2000 ký tự' },
      },
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
  },
  {
    tableName: 'comments',
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['product_id'] },
      { fields: ['rating_id'] },
      { fields: ['parent_id'] },
      { fields: ['is_approved'] },
    ],
  },
);

// Methods
Comment.prototype.markHelpful = async function () {
  this.helpful_count += 1;
  await this.save();
  return this;
};

Comment.prototype.approve = async function () {
  this.is_approved = true;
  await this.save();
  return this;
};

Comment.prototype.getReplies = async function () {
  return await Comment.findAll({
    where: { parent_id: this.id },
    include: [
      {
        model: sequelize.models.User,
        as: 'user',
        attributes: ['id', 'name', 'avatar'],
      },
    ],
    order: [['createdAt', 'ASC']],
  });
};

Comment.associate = (models) => {
  Comment.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
  });
  Comment.belongsTo(models.Product, {
    foreignKey: 'product_id',
    as: 'product',
    onDelete: 'CASCADE',
  });
  Comment.belongsTo(models.Rating, {
    foreignKey: 'rating_id',
    as: 'rating',
    onDelete: 'SET NULL',
  });
  Comment.belongsTo(models.Comment, {
    foreignKey: 'parent_id',
    as: 'parent',
    onDelete: 'CASCADE',
  });
  Comment.hasMany(models.Comment, {
    foreignKey: 'parent_id',
    as: 'replies',
  });
};

module.exports = Comment;
