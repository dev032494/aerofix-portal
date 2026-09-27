'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('flight_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      aircraft_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      station: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      log_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      instructor_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      block_off_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      airborne_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      touchdown_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      blocks_on_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      block_time: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      flight_time: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      ifr_time: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      landings_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      fuel_unit: {
        type: Sequelize.STRING(20),
        allowNull: false
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
    await queryInterface.dropTable('flight_logs');
  }
};
