'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AircraftMonitoringLog extends Model {
    static associate(models) {
      AircraftMonitoringLog.belongsTo(models.FlightLog, { foreignKey: 'flight_log_id', as: 'flightLog' });
    }
  }
  AircraftMonitoringLog.init({
    flight_log_id: { type: DataTypes.INTEGER, allowNull: false },
    entry_type: { 
      type: DataTypes.ENUM('brought_forward', 'this_log', 'total', 'tbo_due'), 
      allowNull: false 
    },
    airframe_time: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
    airframe_ldgs: { type: DataTypes.INTEGER, allowNull: false },
    engine_time: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
    engine_cycles: { type: DataTypes.INTEGER, allowNull: false },
    propeller_time: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
    due_50hrs: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
    due_100hrs: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
    tbo_due: { type: DataTypes.DECIMAL(8, 2), allowNull: true }
  }, {
    sequelize,
    modelName: 'AircraftMonitoringLog',
    tableName: 'aircraft_monitoring_logs',
    underscored: true
  });
  return AircraftMonitoringLog;
};
