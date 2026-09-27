'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MaintenanceDefect extends Model {
    static associate(models) {
      MaintenanceDefect.belongsTo(models.FlightLog, { foreignKey: 'flight_log_id', as: 'flightLog' });
    }
  }
  MaintenanceDefect.init({
    flight_log_id: { type: DataTypes.INTEGER, allowNull: false },
    defects_findings_remarks: { type: DataTypes.TEXT, allowNull: false },
    corrective_action: { type: DataTypes.TEXT, allowNull: true },
    mechanic_signature_stamp: { type: DataTypes.STRING(100), allowNull: true }
  }, {
    sequelize,
    modelName: 'MaintenanceDefect',
    tableName: 'maintenance_defects',
    underscored: true
  });
  return MaintenanceDefect;
};
