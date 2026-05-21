'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. CREATE PARENT: DOCUMENTS TABLE
    await queryInterface.createTable('documents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      document_type: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      aircraft_types: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customization: {
        type: Sequelize.STRING(50),
        defaultValue: 'DEFAULT',
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 2. CREATE CHILD: REVISIONS TABLE
    await queryInterface.createTable('revisions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      document_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'documents', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' 
      },
      revision_number: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      revision_date: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      file_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'superseded'),
        defaultValue: 'active',
        allowNull: false
      },
      compiled_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' 
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 3. BUILD SEARCH PERFORMANCE INDEXES
    await queryInterface.addIndex('documents', ['document_type']);
    await queryInterface.addIndex('documents', ['customization']);
    await queryInterface.addIndex('revisions', ['document_id']);
    await queryInterface.addIndex('revisions', ['status']);
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order to respect dependency constraints
    await queryInterface.dropTable('revisions');
    await queryInterface.dropTable('documents');
    
    // Completely purge custom enum type trackers from database engine memory
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_revisions_status";');
  }
};