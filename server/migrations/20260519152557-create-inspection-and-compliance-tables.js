'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    
    // =========================================================================
    // 1. CREATE RECURRING_INSPECTION TABLE
    // =========================================================================
    await queryInterface.createTable('recurring_inspections', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      aircraft_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'aircraft', // Points to master aircraft table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      inspection_type: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      last_completed_date: {
        type: Sequelize.DATEONLY, // Pure date tracking without timestamps
        allowNull: true
      },
      last_tach_time: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      interval_months: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      interval_hours: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      next_due_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      next_due_tech: { // Kept row name verbatim from image: next_due_tach alias
        type: Sequelize.DECIMAL(10, 2),
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

    // =========================================================================
    // 2. CREATE AD_COMPLIANCE TABLE
    // =========================================================================
    await queryInterface.createTable('ad_compliances', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      aircraft_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'aircraft',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ad_number: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      subject: {
        type: Sequelize.STRING(60),
        allowNull: true
      },
      method_of_compliance: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_recurring: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      next_due_tach: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true // Nullable if 'is_recurring' is false
      },
      logbook_entry_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Nullable if historical entry record doesn't link to an active app logbook yet
        references: {
          model: 'logbook_entries', // Dynamic mapping to your logbook migration table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // If a logbook entry is removed, preserve the compliance history row
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

    // Add search indexes on Foreign Keys to keep query calculations snappy
    await queryInterface.addIndex('recurring_inspections', ['aircraft_id']);
    await queryInterface.addIndex('ad_compliances', ['aircraft_id']);
    await queryInterface.addIndex('ad_compliances', ['logbook_entry_id']);
  },

  async down(queryInterface, Sequelize) {
    // Drop dependent child tables safely in reverse order
    await queryInterface.dropTable('ad_compliances');
    await queryInterface.dropTable('recurring_inspections');
  }
};