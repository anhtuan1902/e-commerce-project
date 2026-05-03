'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conversations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('direct', 'support', 'order_inquiry', 'general'),
        defaultValue: 'general',
        allowNull: false,
      },
      reference_type: {
        type: Sequelize.ENUM('order', 'product', 'vendor', 'general'),
        allowNull: true,
      },
      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'closed', 'archived'),
        defaultValue: 'active',
        allowNull: false,
      },
      last_message_at: {
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
    });

    // Indexes
    await queryInterface.addIndex('conversations', ['user_id']);
    await queryInterface.addIndex('conversations', ['type']);
    await queryInterface.addIndex('conversations', ['status']);
    await queryInterface.addIndex('conversations', ['reference_type', 'reference_id']);
    await queryInterface.addIndex('conversations', ['last_message_at']);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('conversations');
  },
};
