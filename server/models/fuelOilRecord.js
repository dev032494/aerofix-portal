'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FuelOilRecord extends Model {
    static associate(models) {
      FuelOilRecord.belongsTo(models.FlightLog, { foreignKey: 'flight_log_id', as: 'flightLog' });
    }
  }
  FuelOilRecord.init({
    flight_log_id: { type: DataTypes.INTEGER, allowNull: false },
    qty_before_first_flight: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
    qty_after_last_flight: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
    total_burn_out: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
    total_uplift: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
    oil_added: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    pre_flight_performed: { type: DataTypes.BOOLEAN, defaultValue: false },
    instructor_stamp_lic_no: { type: DataTypes.STRING(100), allowNull: true }
  }, {
    sequelize,
    modelName: 'FuelOilRecord',
    tableName: 'fuel_oil_records',
    underscored: true
  });
  return FuelOilRecord;
};
