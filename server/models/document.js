const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Document extends Model {}

  Document.init({
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    title: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    document_type: { 
      type: DataTypes.STRING(20), // AMM, IPC, TSM, WDM
      allowNull: false 
    },
    aircraft_types: { 
      type: DataTypes.STRING, // Store string format e.g: "A318, A319, A320, A321"
      allowNull: false 
    },
    customization: { 
      type: DataTypes.STRING(50), // e.g., "DEMO"
      defaultValue: 'DEFAULT',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Document',
    tableName: 'documents',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Document.associate = function(models) {
    if (models.Revision) {
      Document.hasMany(models.Revision, { 
        foreignKey: 'document_id', 
        as: 'revisions' 
      });
    }
  };

  return Document;
};