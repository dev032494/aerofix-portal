'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('aircrafts', {
      a_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      a_aircraft_type: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      a_registration_number: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      a_create_by: {
        type: Sequelize.STRING(300),
        allowNull: false
      },
      a_create_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('aircrafts');
  }
};