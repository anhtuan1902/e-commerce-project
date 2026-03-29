const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const ProductImage = sequelize.define(
  'ProductImage',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'URL hình ảnh không được để trống' },
        isUrl: { msg: 'URL hình ảnh không hợp lệ' },
      },
    },
    alt_text: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    tableName: 'product_images',
    timestamps: true,
    indexes: [{ fields: ['product_id'] }, { fields: ['is_primary'] }, { fields: ['sort_order'] }],
    hooks: {
      beforeSave: async (image) => {
        if (image.is_primary) {
          // Đảm bảo chỉ có một hình ảnh chính cho mỗi sản phẩm
          await ProductImage.update(
            { is_primary: false },
            {
              where: {
                product_id: image.product_id,
                id: { [sequelize.Sequelize.Op.ne]: image.id },
              },
            },
          );
        }
      },
    },
  },
);

ProductImage.associate = (models) => {
  ProductImage.belongsTo(models.Product, {
    foreignKey: 'product_id',
    as: 'product',
    onDelete: 'CASCADE',
  });
};

module.exports = ProductImage;
