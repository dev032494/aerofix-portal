const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AdCompliance extends Model {
    static associate(models) {
      // 1. Double check 'Aircraft' matching string cases
      if (models.Aircraft) {
        this.belongsTo(models.Aircraft, { foreignKey: 'aircraft_id', as: 'aircraft' });
      }

      // 2. Critical fix: Ensure your LogbookEntry model name exists in the pool safely
      if (models.LogbookEntry) {
        this.belongsTo(models.LogbookEntry, { foreignKey: 'logbook_entry_id', as: 'logbookEntry' });
      } else {
        console.warn("⚠️ [Sequelize Relation Warning] LogbookEntry model not loaded yet when configuring AdCompliance.");
      }
    }
  }

  AdCompliance.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    aircraft_id: { type: DataTypes.INTEGER, allowNull: false },
    ad_number: { type: DataTypes.STRING(60), allowNull: false },
    subject: { type: DataTypes.STRING(60), allowNull: true },
    method_of_compliance: { type: DataTypes.TEXT, allowNull: true },
    is_recurring: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    next_due_tach: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    logbook_entry_id: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    sequelize,
    modelName: 'AdCompliance', // This string sets the key inside models pool!
    tableName: 'ad_compliances',
    underscored: true
  });

  return AdCompliance;
};