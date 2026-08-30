'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('task_item', {
      ti_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      ti_task_detail_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'task_detail',
          key: 'td_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ti_description: {
        type: Sequelize.TEXT('long'), // Maps to LONGTEXT
        allowNull: true
      },
      ti_create_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      ti_update_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('task_item');
  }
};