'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('work_order', {
      wo_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      wo_work_order_number: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      wo_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      wo_instructor: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      wo_status: {
        type: Sequelize.ENUM('active', 'inactive', 'ongoing', 'complete'),
        defaultValue: 'active'
      },
      wo_approve_by: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      wo_approve_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      wo_created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      wo_updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('work_order');
  }
};