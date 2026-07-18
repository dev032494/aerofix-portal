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
        type: Sequelize.STRING(120), // Updated from 60 to 120
        allowNull: false
      },
      middle_name: {
        type: Sequelize.STRING(120), // Added mandatory field
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(120), // Updated from 60 to 120
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true
      },
      user_name: {
        type: Sequelize.STRING(120), // Added unique username field
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'student', 'instructor', 'developer'), // Updated system roles
        allowNull: false,
        defaultValue: 'student'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      is_verified: {
        type: Sequelize.BOOLEAN, // Added tracking field
        allowNull: false,
        defaultValue: false
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

    // Optimized indexing for both primary login identifiers
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['user_name']);
  },

  async down(queryInterface, Sequelize) {
    // Drop the users table entirely
    await queryInterface.dropTable('users');
    
    // Clean up the updated ENUM type definition from database memory if rolling back on PostgreSQL
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
    }
  }
};