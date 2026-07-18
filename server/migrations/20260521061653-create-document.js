'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('documents', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      file_path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // ⚡ Classification metadata columns matching controller fallbacks
      document_type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'SM'
      },
      aircraft_types: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'C150'
      },
      customization: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'CESSNA'
      },
      table_of_contents: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Stores the parsed tree structure of the PDF outlines'
      },
      search_index: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Concatenated string of TOC titles for fast partial matching'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('documents');
  }
};