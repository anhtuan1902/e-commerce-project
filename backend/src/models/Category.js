const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Tên danh mục không được để trống' },
        len: { args: [2, 100], msg: 'Tên danh mục phải từ 2-100 ký tự' },
      },
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Slug không được để trống' },
        is: {
          args: /^[a-z0-9-]+$/,
          msg: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: { msg: 'URL hình ảnh không hợp lệ' },
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    tableName: 'categories',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['name'] },
      { unique: true, fields: ['slug'] },
      { fields: ['is_active'] },
    ],
    hooks: {
      beforeValidate: async (category) => {
        if (category.name && !category.slug) {
          category.slug = category.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        }
      },
    },
  },
);

Category.associate = (models) => {
  Category.hasMany(models.Product, {
    foreignKey: 'category_id',
    as: 'products',
  });
};

module.exports = Category;
