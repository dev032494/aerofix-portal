'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('work_order_personel', {
      wop_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      wop_work_order_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'work_order', // Name of the target table
          key: 'wo_id'         // Key in the target table
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      wop_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('work_order_personel');
  }
};