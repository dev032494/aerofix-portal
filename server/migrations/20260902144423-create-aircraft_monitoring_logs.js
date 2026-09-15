'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('aircraft_monitoring_logs', {
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
      entry_type: {
        type: Sequelize.ENUM('brought_forward', 'this_log', 'total', 'tbo_due'),
        allowNull: false
      },
      airframe_time: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false
      },
      airframe_ldgs: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      engine_time: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false
      },
      engine_cycles: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      propeller_time: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false
      },
      due_50hrs: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      due_100hrs: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      tbo_due: {
        type: Sequelize.DECIMAL(8, 2),
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
    await queryInterface.dropTable('aircraft_monitoring_logs');
  }
};
