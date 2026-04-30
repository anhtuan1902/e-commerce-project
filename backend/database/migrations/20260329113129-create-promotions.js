'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('promotions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vendors',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping'),
        allowNull: false,
      },
      discount_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Percentage or fixed amount',
      },
      minimum_order_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
      },
      maximum_discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      usage_limit: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Total usage limit for this promotion',
      },
      usage_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      user_limit: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false,
        comment: 'How many times a user can use this promotion',
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      coupon_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
      },
      conditions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional conditions for the promotion',
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
    });

    // Indexes
    await queryInterface.addIndex('promotions', ['vendor_id']);
    await queryInterface.addIndex('promotions', ['type']);
    await queryInterface.addIndex('promotions', ['is_active']);
    await queryInterface.addIndex('promotions', ['start_date']);
    await queryInterface.addIndex('promotions', ['end_date']);
    await queryInterface.addIndex('promotions', ['coupon_code']);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('promotions');
  },
};
