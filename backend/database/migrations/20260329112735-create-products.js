'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
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
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(275),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      short_description: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      compare_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      cost_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      weight: {
        type: Sequelize.DECIMAL(8, 3),
        allowNull: true,
        comment: 'Weight in kg',
      },
      dimensions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'JSON object with length, width, height',
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of tags',
      },
      attributes: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Product attributes like color, size, etc.',
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'inactive', 'archived'),
        defaultValue: 'draft',
        allowNull: false,
      },
      visibility: {
        type: Sequelize.ENUM('public', 'private', 'hidden'),
        defaultValue: 'public',
        allowNull: false,
      },
      stock_status: {
        type: Sequelize.ENUM('in_stock', 'out_of_stock', 'on_backorder'),
        defaultValue: 'in_stock',
        allowNull: false,
      },
      allow_backorders: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      sold_individually: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      sold_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Number of products sold',
      },
      seo_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      seo_description: {
        type: Sequelize.STRING(500),
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

    await queryInterface.addIndex('products', ['vendor_id']);
    await queryInterface.addIndex('products', ['category_id']);
    await queryInterface.addIndex('products', ['slug']);
    await queryInterface.addIndex('products', ['sku']);
    await queryInterface.addIndex('products', ['status']);
    await queryInterface.addIndex('products', ['visibility']);
    await queryInterface.addIndex('products', ['stock_status']);
    await queryInterface.addIndex('products', ['featured']);
    await queryInterface.addIndex('products', ['price']);
    await queryInterface.addIndex('products', ['sold_count']);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('products');
  },
};
