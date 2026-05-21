'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    
    // =========================================================================
    // 1. CREATE AIRCRAFT TABLE
    // =========================================================================
    await queryInterface.createTable('aircraft', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      tail_number: {
        type: Sequelize.STRING(60),
        allowNull: false,
        unique: true
      },
      serial_number: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      mode_year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      model_variant: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      base_ttaf: {
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
    // 2. CREATE ENGINE TABLE (Depends on aircraft)
    // =========================================================================
    await queryInterface.createTable('engines', {
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
          model: 'aircraft', // Matches table name
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      make_model: {
        type: Sequelize.STRING(120), // Adjusted from sheet's raw INT to handle real text models (e.g., "Lycoming O-360")
        allowNull: false
      },
      serial_number: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      installed_date: {
        type: Sequelize.DATEONLY, // DATEONLY represents a pure SQL DATE type without time string
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    // 3. CREATE LOGBOOK ENTRY TABLE (Depends on aircraft)
    // =========================================================================
    await queryInterface.createTable('logbook_entries', {
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
      logbook_type: {
        type: Sequelize.ENUM('airframe', 'engine'),
        allowNull: false
      },
      entry_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      tach_time: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      total_time: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      work_order_number: {
        type: Sequelize.STRING(60),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      mechanic_name: { // Fixed minor typo from image row 'mechani_name'
        type: Sequelize.STRING(120),
        allowNull: false
      },
      certificate_number: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      is_signed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    // Add search-performance indexes for lookups on foreign keys
    await queryInterface.addIndex('engines', ['aircraft_id']);
    await queryInterface.addIndex('logbook_entries', ['aircraft_id']);
  },

  async down(queryInterface, Sequelize) {
    // Drop in strict reverse-order of dependencies to avoid database constraint violations
    await queryInterface.dropTable('logbook_entries');
    await queryInterface.dropTable('engines');
    await queryInterface.dropTable('aircraft');

    // Clean up Postgres ENUM type mapping if ever migrating environments
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_logbook_entries_logbook_type";');
    }
  }
};