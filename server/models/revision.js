const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Revision extends Model {}

  Revision.init({
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    document_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    revision_number: { 
      type: DataTypes.STRING(30), // e.g., "Rev 23"
      allowNull: false 
    },
    revision_date: { 
      type: DataTypes.STRING(30), // e.g., "21-May-2026"
      allowNull: false 
    },
    file_url: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    status: { 
      type: DataTypes.ENUM('active', 'superseded'), 
      defaultValue: 'active', 
      allowNull: false 
    },
    compiled_by: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'Revision',
    tableName: 'revisions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Revision.associate = function(models) {
    if (models.Document) {
      Revision.belongsTo(models.Document, { 
        foreignKey: 'document_id', 
        as: 'document' 
      });
    }
    if (models.User) {
      Revision.belongsTo(models.User, { 
        foreignKey: 'compiled_by', 
        as: 'compiler' 
      });
    }
  };

  return Revision;
};