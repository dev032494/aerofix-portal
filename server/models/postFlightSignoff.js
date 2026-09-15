'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostFlightSignoff extends Model {
    static associate(models) {
      PostFlightSignoff.belongsTo(models.FlightLog, { foreignKey: 'flight_log_id', as: 'flightLog' });
    }
  }
  PostFlightSignoff.init({
    flight_log_id: { type: DataTypes.INTEGER, allowNull: false },
    signoff_type: { type: DataTypes.STRING(50), defaultValue: 'POST_FLIGHT' },
    signee_name: { type: DataTypes.STRING(150), allowNull: false },
    signee_license_no: { type: DataTypes.STRING(100), allowNull: true },
    signed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'PostFlightSignoff',
    tableName: 'post_flight_signoffs',
    underscored: true
  });
  return PostFlightSignoff;
};
