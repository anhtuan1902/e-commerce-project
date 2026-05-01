const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Promotion = sequelize.define(
  'Promotion',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vendors',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Tên khuyến mãi không được để trống' },
        len: { args: [2, 255], msg: 'Tên khuyến mãi phải từ 2-255 ký tự' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping']],
          msg: 'Loại khuyến mãi không hợp lệ',
        },
      },
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    minimum_order_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
      validate: {
        min: 0,
      },
    },
    maximum_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
      },
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    user_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfter: new Date().toISOString(),
      },
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfter(value) {
          if (this.start_date && value <= this.start_date) {
            throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
          }
        },
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    coupon_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      validate: {
        len: { args: [3, 50], msg: 'Mã coupon phải từ 3-50 ký tự' },
      },
    },
    conditions: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: 'promotions',
    timestamps: true,
    indexes: [
      { fields: ['vendor_id'] },
      { fields: ['type'] },
      { fields: ['is_active'] },
      { fields: ['start_date'] },
      { fields: ['end_date'] },
      { unique: true, fields: ['coupon_code'] },
    ],
  },
);

// Methods
Promotion.prototype.isValid = function () {
  const now = new Date();
  return (
    this.is_active &&
    now >= this.start_date &&
    now <= this.end_date &&
    (this.usage_limit === null || this.usage_count < this.usage_limit)
  );
};

Promotion.prototype.canApplyToOrder = function (orderTotal, userUsageCount = 0) {
  return (
    this.isValid() && orderTotal >= this.minimum_order_value && userUsageCount < this.user_limit
  );
};

Promotion.prototype.calculateDiscount = function (_orderTotal) {
  if (!this.isValid()) return 0;

  let discount = 0;

  // switch (this.type) {
  //   case 'percentage':
  //     discount = (orderTotal * this.discount_value) / 100;
  //     break;
  //   case 'fixed_amount':
  //     discount = parseFloat(this.discount_value);
  //     break;
  //   case 'free_shipping':
  //     // This would be handled separately in shipping calculation
  //     discount = 0;
  //     break;
  //   case 'buy_x_get_y':
  //     // Complex logic for buy X get Y free
  //     discount = 0; // Placeholder
  //     break;
  // }

  if (this.maximum_discount && discount > this.maximum_discount) {
    discount = this.maximum_discount;
  }

  return discount;
};

Promotion.prototype.incrementUsage = async function () {
  this.usage_count += 1;
  await this.save();
  return this;
};

Promotion.associate = (models) => {
  Promotion.belongsTo(models.Vendor, {
    foreignKey: 'vendor_id',
    as: 'vendor',
    onDelete: 'CASCADE',
  });
  Promotion.belongsToMany(models.Product, {
    through: models.PromotionProduct,
    foreignKey: 'promotion_id',
    otherKey: 'product_id',
    as: 'products',
  });
};

module.exports = Promotion;
