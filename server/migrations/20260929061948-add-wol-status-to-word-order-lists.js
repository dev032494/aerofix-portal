'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('work_order_list', 'wol_status', {
      type: Sequelize.ENUM('active', 'inactive', 'deleted'),
      allowNull: false,
      defaultValue: 'active'
    });
  },

  async down(queryInterface, Sequelize) {
    // 1. Remove the column
    await queryInterface.removeColumn('work_order_list', 'wol_status');

    // 2. PostgreSQL extra step: drop the ENUM type created automatically by Sequelize
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_word_order_list_wol_status";'
    );
  }
};