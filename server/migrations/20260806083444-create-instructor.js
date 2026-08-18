'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('instructor', {
      i_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      i_first_name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      i_middle_name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      i_last_name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      i_license_number: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      i_create_by: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      i_create_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      i_status: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true
      }
    });

    // Indexes for fast lookups and filtering
    await queryInterface.addIndex('instructor', ['i_license_number']);
    await queryInterface.addIndex('instructor', ['i_last_name', 'i_first_name']);
    await queryInterface.addIndex('instructor', ['i_create_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('instructor');
  }
};