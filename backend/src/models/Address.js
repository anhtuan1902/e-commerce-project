const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Address = sequelize.define(
  'Address',
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
    type: {
      type: DataTypes.ENUM('home', 'work', 'billing', 'shipping'),
      defaultValue: 'home',
      allowNull: false,
      validate: {
        isIn: {
          args: [['home', 'work', 'billing', 'shipping']],
          msg: 'Loại địa chỉ không hợp lệ',
        },
      },
    },
    address_line_1: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Địa chỉ dòng 1 không được để trống' },
        len: { args: [5, 255], msg: 'Địa chỉ phải từ 5-255 ký tự' },
      },
    },
    address_line_2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Thành phố không được để trống' },
        len: { args: [2, 100], msg: 'Tên thành phố phải từ 2-100 ký tự' },
      },
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Mã bưu điện không được để trống' },
      },
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'Vietnam',
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Quốc gia không được để trống' },
      },
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    tableName: 'addresses',
    timestamps: true,
    indexes: [{ fields: ['user_id'] }, { fields: ['type'] }, { fields: ['is_default'] }],
    hooks: {
      // Đảm bảo chỉ có một địa chỉ mặc định cho mỗi user
      beforeSave: async (address) => {
        if (address.is_default) {
          await Address.update(
            { is_default: false },
            {
              where: {
                user_id: address.user_id,
                id: { [sequelize.Sequelize.Op.ne]: address.id },
              },
            },
          );
        }
      },
    },
  },
);

// Method để lấy địa chỉ đầy đủ
Address.prototype.getFullAddress = function () {
  const parts = [this.address_line_1];
  if (this.address_line_2) parts.push(this.address_line_2);
  parts.push(`${this.city}, ${this.state || ''} ${this.postal_code}`);
  parts.push(this.country);
  return parts.filter(Boolean).join(', ');
};

Address.associate = (models) => {
  Address.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
  });
  Address.hasMany(models.Order, {
    foreignKey: 'shipping_address_id',
    as: 'shippingOrders',
  });
  Address.hasMany(models.Order, {
    foreignKey: 'billing_address_id',
    as: 'billingOrders',
  });
};

module.exports = Address;
