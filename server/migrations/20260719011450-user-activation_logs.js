'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_activation_logs', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      actioned_by: {
        type: Sequelize.INTEGER,
        allowNull: true, // Nullable in case of automated workflow validations
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.ENUM('approved', 'rejected'),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true // Crucial for storing operational rejection feedback
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Indexes optimize lookups when loading history lists for specific target users
    await queryInterface.addIndex('user_activation_logs', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_activation_logs');

    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_user_activation_logs_action";');
    }
  }
};