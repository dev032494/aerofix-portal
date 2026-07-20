'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Generate secure bcrypt password hashes
    const hashedPassword_developer = await bcrypt.hash('10030324', 12);
    const hashedPassword_admin = await bcrypt.hash('123456', 12);
    const hashedPassword_instructor = await bcrypt.hash('654321', 12);

    await queryInterface.bulkInsert('users', [
      {
        first_name: 'Joseph',
        middle_name: 'Abrico',
        last_name: 'Orencio',
        email: 'josephorencio032494@gmail.com',
        user_name: 'dev42',
        password_hash: hashedPassword_developer,
        role: 'developer',
        is_active: true,
        is_verified: true,
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        first_name: 'Emmalyn',
        middle_name: '',
        last_name: 'Nagales',
        email: 'emmalyn@aerofix.com', // ⚡ FIXED: Added distinct placeholder email to avoid UNIQUE constraint clashes
        user_name: 'emmalyn',
        password_hash: hashedPassword_admin,
        role: 'admin',
        is_active: true,
        is_verified: true,
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        first_name: 'Instructor',
        middle_name: '',
        last_name: 'Account',
        email: 'instructor@aerofix.com', // ⚡ FIXED: Added distinct placeholder email to avoid UNIQUE constraint clashes
        user_name: 'instructor',
        password_hash: hashedPassword_instructor,
        role: 'instructor',
        is_active: true,
        is_verified: true,
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // ⚡ FIXED: Target the exact usernames inserted in the up() method
    await queryInterface.bulkDelete('users', {
      user_name: ['dev42', 'emmalyn', 'instructor']
    }, {});
  }
};