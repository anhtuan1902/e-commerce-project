'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vendors', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      store_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      logo_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      banner_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      contact_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      contact_phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      business_type: {
        type: Sequelize.ENUM('individual', 'business', 'enterprise'),
        defaultValue: 'individual',
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'suspended', 'inactive'),
        defaultValue: 'pending',
        allowNull: false,
      },
      commission_rate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.0,
        allowNull: false,
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
    await queryInterface.addIndex('vendors', ['user_id'], { unique: true });
    await queryInterface.addIndex('vendors', ['status']);
    await queryInterface.addIndex('vendors', ['business_type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vendors');
  },
};
