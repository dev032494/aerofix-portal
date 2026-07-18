'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  Document.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    document_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'SM'
    },
    aircraft_types: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'C150'
    },
    customization: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'CESSNA'
    },
    table_of_contents: {
      type: DataTypes.JSON,
      allowNull: true
    },
    search_index: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Document',
    tableName: 'documents',
    timestamps: true,
    underscored: false, // ⚡ FIX: Turn off naming translation algorithms entirely
    createdAt: 'created_at', // ⚡ Directly map camelCase runtime timestamps to snake_case DB columns
    updatedAt: 'updated_at'
  });

  return Document;
};