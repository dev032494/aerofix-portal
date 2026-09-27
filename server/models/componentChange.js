'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ComponentChange extends Model {
    static associate(models) {
      ComponentChange.belongsTo(models.FlightLog, { foreignKey: 'flight_log_id', as: 'flightLog' });
    }
  }
  ComponentChange.init({
    flight_log_id: { type: DataTypes.INTEGER, allowNull: false },
    position: { type: DataTypes.STRING(50), allowNull: true },
    nomenclature: { type: DataTypes.STRING(150), allowNull: false },
    part_number_out: { type: DataTypes.STRING(100), allowNull: true },
    serial_number_out: { type: DataTypes.STRING(100), allowNull: true },
    part_number_in: { type: DataTypes.STRING(100), allowNull: true },
    serial_number_in: { type: DataTypes.STRING(100), allowNull: true }
  }, {
    sequelize,
    modelName: 'ComponentChange',
    tableName: 'component_changes',
    underscored: true
  });
  return ComponentChange;
};
