'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Generate identical secure bcrypt password hashes
    const hashedPassword = await bcrypt.hash('123456', 12);

    await queryInterface.bulkInsert('users', [
      {
        first_name: 'Joseph',
        middle_name: 'Abrico',
        last_name: 'Orencio',
        email: 'josephorencio032494@gmail.com',
        user_name: 'dev42',
        password_hash: hashedPassword, // Match your database schema custom field
        role: 'developer',
        is_active: true,
        is_verified: true, // System accounts are initialized pre-verified
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date()
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Clean up administrative seeds from system records
    await queryInterface.bulkDelete('users', {
      user_name: ['sys_admin', 'dev_operator']
    }, {});
  }
};