const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Aircraft extends Model {
    static associate(models) {
      if (models.Engine) this.hasMany(models.Engine, { foreignKey: 'aircraft_id', as: 'engines' });
      if (models.LogbookEntry) this.hasMany(models.LogbookEntry, { foreignKey: 'aircraft_id', as: 'logbookEntries' });
      if (models.RecurringInspection) this.hasMany(models.RecurringInspection, { foreignKey: 'aircraft_id', as: 'inspections' });
      if (models.AdCompliance) this.hasMany(models.AdCompliance, { foreignKey: 'aircraft_id', as: 'compliances' });
      if (models.WorkOrder) this.hasMany(models.WorkOrder, { foreignKey: 'aircraft_id', as: 'workOrders' });
    }
  }

  Aircraft.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tail_number: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    serial_number: { type: DataTypes.STRING(60), allowNull: false },
    mode_year: { type: DataTypes.INTEGER, allowNull: true },
    model_variant: { type: DataTypes.STRING(60), allowNull: false },
    base_ttaf: { type: DataTypes.DECIMAL(10, 2), allowNull: true }
  }, {
    sequelize,
    modelName: 'Aircraft',
    tableName: 'aircraft',
    underscored: true
  });

  return Aircraft;
};