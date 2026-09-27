'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('post_flight_signoffs', {
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
      signoff_type: {
        type: Sequelize.STRING(50),
        defaultValue: 'POST_FLIGHT'
      },
      signee_name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      signee_license_no: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      signed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
    await queryInterface.dropTable('post_flight_signoffs');
  }
};
