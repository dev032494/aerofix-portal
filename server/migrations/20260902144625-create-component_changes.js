'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('component_changes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      flight_log_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'flight_logs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      position: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      nomenclature: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      part_number_out: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      serial_number_out: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      part_number_in: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      serial_number_in: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('component_changes');
  }
};
