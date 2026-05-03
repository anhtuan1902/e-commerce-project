'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_profiles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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

      name: {
        type: Sequelize.STRING,
        allowNull: true, // null nếu đăng nhập bằng Google
      },

      avatar: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      birthday: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
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

    // Index giúp query nhanh hơn
    await queryInterface.addIndex('user_profiles', ['user_id']);
    await queryInterface.addIndex('user_profiles', ['name']);
    await queryInterface.addIndex('user_profiles', ['phone']);
    await queryInterface.addIndex('user_profiles', ['gender']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_profiles');
  },
};
