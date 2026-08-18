'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('work_order_action_taken', {
      woat_work_order_item_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'work_order_items', // Target table
          key: 'woi_id'              // Target key
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      woat_description: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('work_order_action_taken');
  }
};