'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('maintenance_defects', {
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
      defects_findings_remarks: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      corrective_action: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      mechanic_signature_stamp: {
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
    await queryInterface.dropTable('maintenance_defects');
  }
};
