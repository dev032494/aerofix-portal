'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('work_order_parts_replacement', {
      wopr_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      wopr_work_order_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'work_order', // Target table
          key: 'wo_id'         // Target key
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      wopr_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      wopr_nomenclature: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      wopr_part_number: {
        type: Sequelize.STRING(300),
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
    await queryInterface.dropTable('work_order_parts_replacement');
  }
};