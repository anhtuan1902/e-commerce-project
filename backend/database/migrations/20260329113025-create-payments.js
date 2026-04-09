'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      payment_method: {
        type: Sequelize.ENUM(
          'credit_card',
          'debit_card',
          'paypal',
          'bank_transfer',
          'cash_on_delivery',
          'digital_wallet',
          'loyalty_points',
        ),
        allowNull: false,
      },
      payment_gateway: {
        type: Sequelize.ENUM('stripe', 'paypal', 'vnpay', 'momo', 'zalopay', 'manual'),
        allowNull: true,
      },
      transaction_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'VND',
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'processing',
          'completed',
          'failed',
          'cancelled',
          'refunded',
        ),
        defaultValue: 'pending',
        allowNull: false,
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      failure_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      gateway_response: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      refunded_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
      refund_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Indexes
    await queryInterface.addIndex('payments', ['order_id']);
    await queryInterface.addIndex('payments', ['transaction_id']);
    await queryInterface.addIndex('payments', ['status']);
    await queryInterface.addIndex('payments', ['payment_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  },
};
