'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Aircraft extends Model {}

  Aircraft.init({
    a_id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true, 
      allowNull: false 
    },
    a_aircraft_type: { 
      type: DataTypes.STRING(300), 
      allowNull: false 
    },
    a_registration_number: { 
      type: DataTypes.STRING(120), 
      allowNull: false 
    },
    a_create_by: { 
      type: DataTypes.STRING(300), 
      allowNull: false 
    },
    a_create_at: { 
      type: DataTypes.DATE, 
      allowNull: true, 
      defaultValue: DataTypes.NOW 
    }
  }, {
    sequelize,
    modelName: 'Aircraft',
    tableName: 'aircrafts',
    timestamps: false, // Disabled to accommodate the custom a_create_at field
    underscored: true
  });

  return Aircraft;
};