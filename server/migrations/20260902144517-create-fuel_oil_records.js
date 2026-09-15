'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fuel_oil_records', {
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
      qty_before_first_flight: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      qty_after_last_flight: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      total_burn_out: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      total_uplift: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      oil_added: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true
      },
      pre_flight_performed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      instructor_stamp_lic_no: {
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
    await queryInterface.dropTable('fuel_oil_records');
  }
};
