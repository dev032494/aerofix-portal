'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    
    // =========================================================================
    // 1. CREATE WORK_ORDER TABLE
    // =========================================================================
    await queryInterface.createTable('work_orders', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      aircraft_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'aircraft', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      work_order_number: {
        type: Sequelize.STRING(60),
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'closed'),
        allowNull: false,
        defaultValue: 'open'
      },
      opened_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('(CURRENT_DATE)')
      },
      closed_date: {
        type: Sequelize.DATEONLY,
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
    // 2. CREATE TASK_CARD TABLE
    // =========================================================================
    await queryInterface.createTable('task_cards', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      work_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'work_orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      task_code: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      ata_chapter: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      reference_manual: {
        type: Sequelize.STRING(60),
        allowNull: true
      },
      estimated_hours: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'signed_off'),
        allowNull: false,
        defaultValue: 'pending'
      },
      mechanic_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' }, // Relates back to master user table config
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      inspector_user_id: { // Fixed tiny image typo spelling label 'inspector_user_iid'
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      completed_at: {
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

    // =========================================================================
    // 3. CREATE TASK_CARD_PART TABLE
    // =========================================================================
    await queryInterface.createTable('task_card_parts', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      task_card_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'task_cards', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      part_number: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      quantity_required: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1.00
      },
      ipc_reference: { // Illustrated Parts Catalog ref
        type: Sequelize.STRING(60),
        allowNull: true
      },
      is_issued: {
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

    // =========================================================================
    // 4. CREATE TASK_CARD_STEP TABLE
    // =========================================================================
    await queryInterface.createTable('task_card_steps', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      task_card_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'task_cards', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      step_order: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      instruction: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      torque_spec: {
        type: Sequelize.STRING(60),
        allowNull: true
      },
      is_completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      signed_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      inspector_note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      completed_at: {
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

    // =========================================================================
    // PERFORMANCE DATABASE INDEX MAPPINGS
    // =========================================================================
    await queryInterface.addIndex('work_orders', ['aircraft_id']);
    await queryInterface.addIndex('work_orders', ['work_order_number']);
    await queryInterface.addIndex('task_cards', ['work_order_id']);
    await queryInterface.addIndex('task_card_parts', ['task_card_id']);
    await queryInterface.addIndex('task_card_steps', ['task_card_id', 'step_order']); // Composite index for sequential sorting
  },

  async down(queryInterface, Sequelize) {
    // Drop cascading entities in order of dependencies to respect schema foreign keys
    await queryInterface.dropTable('task_card_steps');
    await queryInterface.dropTable('task_card_parts');
    await queryInterface.dropTable('task_cards');
    await queryInterface.dropTable('work_orders');

    // Clean up explicit Postgres memory references if converting dialects later
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_work_orders_status";');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_task_cards_status";');
    }
  }
};