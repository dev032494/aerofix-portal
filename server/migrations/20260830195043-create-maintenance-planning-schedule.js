// --- 1. Sequelize Migration ---
// migrations/YYYYMMDDHHMMSS-create-maintenance-planning-schedule.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('maintenance_planning_schedule', {
      mps_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      mps_aircraft_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      mps_task_detail_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      mps_manual_detail_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      mps_recuring_month: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      mps_create_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      mps_update_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('maintenance_planning_schedule');
  }
};