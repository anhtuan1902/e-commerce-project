const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    vendor_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'vendors',
        key: 'id',
      },
    },
    category_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Tên sản phẩm không được để trống' },
        len: { args: [2, 255], msg: 'Tên sản phẩm phải từ 2-255 ký tự' },
      },
    },
    slug: {
      type: DataTypes.STRING(275),
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
    short_description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    compare_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    weight: {
      type: DataTypes.DECIMAL(8, 3),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    dimensions: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isValidDimensions(value) {
          if (value && typeof value === 'object') {
            const { length, width, height } = value;
            if (length && length < 0) throw new Error('Chiều dài phải >= 0');
            if (width && width < 0) throw new Error('Chiều rộng phải >= 0');
            if (height && height < 0) throw new Error('Chiều cao phải >= 0');
          }
        },
      },
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isValidTags(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Tags phải là mảng');
          }
        },
      },
    },
    attributes: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'inactive', 'archived'),
      defaultValue: 'draft',
      allowNull: false,
    },
    visibility: {
      type: DataTypes.ENUM('public', 'private', 'hidden'),
      defaultValue: 'public',
      allowNull: false,
    },
    stock_status: {
      type: DataTypes.ENUM('in_stock', 'out_of_stock', 'on_backorder'),
      defaultValue: 'in_stock',
      allowNull: false,
    },
    allow_backorders: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    sold_individually: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    seo_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    seo_description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: 'products',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['vendor_id'] },
      { fields: ['category_id'] },
      { unique: true, fields: ['slug'] },
      { unique: true, fields: ['sku'] },
      { fields: ['status'] },
      { fields: ['visibility'] },
      { fields: ['stock_status'] },
      { fields: ['featured'] },
      { fields: ['price'] },
    ],
    hooks: {
      beforeValidate: async (product) => {
        if (product.name && !product.slug) {
          product.slug = product.name
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
Product.prototype.getPrimaryImage = async function () {
  return await sequelize.models.ProductImage.findOne({
    where: { product_id: this.id, is_primary: true },
  });
};

Product.prototype.getAllImages = async function () {
  return await sequelize.models.ProductImage.findAll({
    where: { product_id: this.id },
    order: [
      ['sort_order', 'ASC'],
      ['createdAt', 'ASC'],
    ],
  });
};

Product.prototype.getInventory = async function () {
  return await sequelize.models.Inventory.findOne({
    where: { product_id: this.id },
  });
};

Product.prototype.isInStock = async function () {
  const inventory = await this.getInventory();
  if (!inventory || !inventory.track_inventory) return true;
  return inventory.quantity > 0;
};

Product.prototype.getDiscountPercentage = function () {
  if (this.compare_price && this.compare_price > this.price) {
    return Math.round(((this.compare_price - this.price) / this.compare_price) * 100);
  }
  return 0;
};

Product.associate = (models) => {
  Product.belongsTo(models.Vendor, {
    foreignKey: 'vendor_id',
    as: 'vendor',
    onDelete: 'CASCADE',
  });
  Product.belongsTo(models.Category, {
    foreignKey: 'category_id',
    as: 'category',
    onDelete: 'RESTRICT',
  });
  Product.hasMany(models.ProductImage, {
    foreignKey: 'product_id',
    as: 'images',
  });
  Product.hasOne(models.Inventory, {
    foreignKey: 'product_id',
    as: 'inventory',
  });
  Product.hasMany(models.OrderItem, {
    foreignKey: 'product_id',
    as: 'orderItems',
  });
  Product.hasMany(models.Rating, {
    foreignKey: 'product_id',
    as: 'ratings',
  });
  Product.hasMany(models.Comment, {
    foreignKey: 'product_id',
    as: 'comments',
  });
  Product.hasMany(models.Wishlist, {
    foreignKey: 'product_id',
    as: 'wishlists',
  });
  Product.hasMany(models.PromotionProduct, {
    foreignKey: 'product_id',
    as: 'promotionProducts',
  });
};

module.exports = Product;
