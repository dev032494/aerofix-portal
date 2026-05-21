const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RecurringInspection extends Model {
    static associate(models) {
      if (models.Aircraft) {
        this.belongsTo(models.Aircraft, { foreignKey: 'aircraft_id', as: 'aircraft' });
      }
    }
  }

  RecurringInspection.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    aircraft_id: { type: DataTypes.INTEGER, allowNull: false },
    inspection_type: { type: DataTypes.STRING(60), allowNull: false },
    last_completed_date: { type: DataTypes.DATEONLY, allowNull: true },
    last_tach_time: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    interval_months: { type: DataTypes.INTEGER, allowNull: true },
    interval_hours: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    next_due_date: { type: DataTypes.DATEONLY, allowNull: true },
    next_due_tech: { type: DataTypes.DECIMAL(10, 2), allowNull: true }
  }, {
    sequelize,
    modelName: 'RecurringInspection',
    tableName: 'recurring_inspections',
    underscored: true
  });

  return RecurringInspection;
};