'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'confirmed',
          'processing',
          'shipped',
          'delivered',
          'cancelled',
          'refunded',
        ),
        defaultValue: 'pending',
        allowNull: false,
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded'),
        defaultValue: 'pending',
        allowNull: false,
      },
      shipping_status: {
        type: Sequelize.ENUM('not_shipped', 'shipped', 'delivered', 'returned'),
        defaultValue: 'not_shipped',
        allowNull: false,
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      shipping_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'VND',
        allowNull: false,
      },
      shipping_address_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'addresses',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      billing_address_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'addresses',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      customer_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ordered_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      shipped_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      delivered_at: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('orders', ['order_number']);
    await queryInterface.addIndex('orders', ['user_id']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('orders', ['payment_status']);
    await queryInterface.addIndex('orders', ['shipping_status']);
    await queryInterface.addIndex('orders', ['ordered_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  },
};
