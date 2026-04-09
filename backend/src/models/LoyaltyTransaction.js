const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const LoyaltyTransaction = sequelize.define(
  'LoyaltyTransaction',
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
    wallet_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'loyalty_wallets',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('earn', 'spend', 'refund', 'adjustment'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['earn', 'spend', 'refund', 'adjustment']],
          msg: 'Loại giao dịch không hợp lệ',
        },
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    balance_before: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    balance_after: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reference_type: {
      type: DataTypes.ENUM('order', 'review', 'referral', 'admin', 'refund'),
      allowNull: true,
    },
    reference_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: 'loyalty_transactions',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['wallet_id'] },
      { fields: ['type'] },
      { fields: ['reference_type', 'reference_id'] },
    ],
  },
);

LoyaltyTransaction.associate = (models) => {
  LoyaltyTransaction.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
  });
  LoyaltyTransaction.belongsTo(models.LoyaltyWallet, {
    foreignKey: 'wallet_id',
    as: 'wallet',
    onDelete: 'CASCADE',
  });
};

module.exports = LoyaltyTransaction;
