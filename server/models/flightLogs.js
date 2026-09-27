'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FlightLog extends Model {
    static associate(models) {
      FlightLog.hasMany(models.AircraftMonitoringLog, { foreignKey: 'flight_log_id', as: 'monitoringLogs' });
      FlightLog.hasMany(models.FuelOilRecord, { foreignKey: 'flight_log_id', as: 'fuelOilRecords' });
      FlightLog.hasMany(models.MaintenanceDefect, { foreignKey: 'flight_log_id', as: 'defects' });
      FlightLog.hasMany(models.ComponentChange, { foreignKey: 'flight_log_id', as: 'componentChanges' });
      FlightLog.hasMany(models.PostFlightSignoff, { foreignKey: 'flight_log_id', as: 'signoffs' });
    }
  }
  FlightLog.init({
    aircraft_id: { type: DataTypes.STRING(32), allowNull: false },
    station: { type: DataTypes.STRING(50), allowNull: false },
    log_date: { type: DataTypes.DATEONLY, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: true },
    instructor_id: { type: DataTypes.INTEGER, allowNull: true },
    block_off_time: { type: DataTypes.DATE, allowNull: true },
    airborne_time: { type: DataTypes.DATE, allowNull: true },
    touchdown_time: { type: DataTypes.DATE, allowNull: true },
    blocks_on_time: { type: DataTypes.DATE, allowNull: true },
    block_time: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    flight_time: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    ifr_time: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    landings_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    fuel_unit: { type: DataTypes.STRING(20), allowNull: false }
  }, {
    sequelize,
    modelName: 'FlightLog',
    tableName: 'flight_logs',
    underscored: true
  });
  return FlightLog;
};