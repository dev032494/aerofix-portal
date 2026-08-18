'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('work_order_list', {
      wol_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      wol_description: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      wol_create_by: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      wol_create_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('work_order_list');
  }
};