'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('manual_item', {
      mi_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      mi_manual_detail_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'manual_detail',
          key: 'md_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      mi_description: {
        type: Sequelize.TEXT('long'), // Maps to LONGTEXT
        allowNull: true
      },
      mi_create_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      mi_update_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('manual_item');
  }
};