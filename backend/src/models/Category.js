const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
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
    parent_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
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
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    tableName: 'categories',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['name'] },
      { unique: true, fields: ['slug'] },
      { fields: ['parent_id'] },
      { fields: ['is_active'] },
      { fields: ['sort_order'] },
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

// Methods
Category.prototype.getFullPath = async function () {
  const path = [this.name];
  let current = this;

  while (current.parent_id) {
    current = await Category.findByPk(current.parent_id);
    if (current) {
      path.unshift(current.name);
    } else {
      break;
    }
  }

  return path.join(' > ');
};

Category.prototype.getChildren = async function (depth = null) {
  const where = { parent_id: this.id };
  if (depth === 1) {
    return await Category.findAll({ where });
  }

  // Recursive loading for deeper levels
  const children = await Category.findAll({ where });
  if (depth === null || depth > 1) {
    for (const child of children) {
      child.children = await child.getChildren(depth ? depth - 1 : null);
    }
  }

  return children;
};

Category.associate = (models) => {
  Category.belongsTo(models.Category, {
    foreignKey: 'parent_id',
    as: 'parent',
    onDelete: 'SET NULL',
  });
  Category.hasMany(models.Category, {
    foreignKey: 'parent_id',
    as: 'children',
  });
  Category.hasMany(models.Product, {
    foreignKey: 'category_id',
    as: 'products',
  });
};

module.exports = Category;
