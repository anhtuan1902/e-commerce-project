const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const LoyaltyWallet = sequelize.define(
  'LoyaltyWallet',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    total_earned: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    total_spent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended', 'closed'),
      defaultValue: 'active',
      allowNull: false,
    },
  },
  {
    tableName: 'loyalty_wallets',
    timestamps: true,
    paranoid: true,
    indexes: [{ unique: true, fields: ['user_id'] }, { fields: ['status'] }],
  },
);

// Methods
LoyaltyWallet.prototype.addPoints = async function (
  amount,
  description,
  referenceType,
  referenceId,
) {
  const balanceBefore = this.balance;
  this.balance = parseFloat(this.balance) + parseFloat(amount);
  this.total_earned = parseFloat(this.total_earned) + parseFloat(amount);
  await this.save();

  // Create transaction record
  await sequelize.models.LoyaltyTransaction.create({
    user_id: this.user_id,
    wallet_id: this.id,
    type: 'earn',
    amount: amount,
    balance_before: balanceBefore,
    balance_after: this.balance,
    description: description,
    reference_type: referenceType,
    reference_id: referenceId,
  });

  return this;
};

LoyaltyWallet.prototype.spendPoints = async function (
  amount,
  description,
  referenceType,
  referenceId,
) {
  if (parseFloat(this.balance) < parseFloat(amount)) {
    throw new Error('Insufficient loyalty points');
  }

  const balanceBefore = this.balance;
  this.balance = parseFloat(this.balance) - parseFloat(amount);
  this.total_spent = parseFloat(this.total_spent) + parseFloat(amount);
  await this.save();

  // Create transaction record
  await sequelize.models.LoyaltyTransaction.create({
    user_id: this.user_id,
    wallet_id: this.id,
    type: 'spend',
    amount: amount,
    balance_before: balanceBefore,
    balance_after: this.balance,
    description: description,
    reference_type: referenceType,
    reference_id: referenceId,
  });

  return this;
};

LoyaltyWallet.associate = (models) => {
  LoyaltyWallet.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
  });
  LoyaltyWallet.hasMany(models.LoyaltyTransaction, {
    foreignKey: 'wallet_id',
    as: 'transactions',
  });
};

module.exports = LoyaltyWallet;
