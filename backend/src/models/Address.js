const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Address = sequelize.define(
  'Address',
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
    type: {
      type: DataTypes.ENUM('home', 'work'),
      defaultValue: 'home',
      allowNull: false,
      validate: {
        isIn: {
          args: [['home', 'work']],
          msg: 'Loại địa chỉ không hợp lệ',
        },
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address_detail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ward: {
      type: DataTypes.STRING,
      allowNull: false,
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
  const parts = [this.address_detail, this.ward, this.city];
  return parts.join(', ');
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
};

module.exports = Address;
