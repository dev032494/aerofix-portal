const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class LogbookEntry extends Model {
    static associate(models) {
      if (models.Aircraft) {
        this.belongsTo(models.Aircraft, { foreignKey: 'aircraft_id', as: 'aircraft' });
      }
      if (models.AdCompliance) {
        this.hasMany(models.AdCompliance, { foreignKey: 'logbook_entry_id', as: 'linkedCompliances' });
      }
    }
  }

  LogbookEntry.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    aircraft_id: { type: DataTypes.INTEGER, allowNull: false },
    logbook_type: { type: DataTypes.ENUM('airframe', 'engine'), allowNull: false },
    entry_date: { type: DataTypes.DATEONLY, allowNull: false },
    tach_time: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total_time: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    work_order_number: { type: DataTypes.STRING(60), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    mechanic_name: { type: DataTypes.STRING(120), allowNull: false },
    certificate_number: { type: DataTypes.STRING(60), allowNull: false },
    is_signed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    sequelize,
    modelName: 'LogbookEntry',
    tableName: 'logbook_entries',
    underscored: true
  });

  return LogbookEntry;
};