'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      first_name: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true // Ensures distinct user logins
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      signature_pin_hash: {
        type: Sequelize.TEXT,
        allowNull: true // Set to true if a pin is created later
      },
      role: {
        type: Sequelize.ENUM('admin', 'manager', 'mechanic', 'inspector'),
        allowNull: false,
        defaultValue: 'mechanic'
      },
      certificate_type: {
        type: Sequelize.STRING(60),
        allowNull: true // Optional depending on role (e.g. mechanics/inspectors vs managers)
      },
      certificate_number: {
        type: Sequelize.STRING(60),
        allowNull: true,
        unique: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Recommended optimization for frequent lookups on authentication
    await queryInterface.addIndex('users', ['email']);
  },

  async down(queryInterface, Sequelize) {
    // Drop the users table entirely
    await queryInterface.dropTable('users');
    
    // Clean up the ENUM type definition from database memory if rolling back on PostgreSQL
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
    }
  }
};