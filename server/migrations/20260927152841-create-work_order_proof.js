'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('work_order_proofs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      work_order_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Foreign key referencing work_orders table'
      },
      file_path: {
        type: Sequelize.STRING(550),
        allowNull: false,
        comment: 'Relative web path (e.g., /work_order/WO-101/proof-123.jpg)'
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Stored file name on disk'
      },
      caption: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Optional image description or label'
      },
      uploaded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add Index for fast queries when fetching proofs by work_order_number
    await queryInterface.addIndex('work_order_proofs', ['work_order_number'], {
      name: 'idx_work_order_proofs_wo_number'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('work_order_proofs');
  }
};