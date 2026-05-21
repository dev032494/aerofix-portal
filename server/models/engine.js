const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Engine extends Model {
    static associate(models) {
      if (models.Aircraft) {
        this.belongsTo(models.Aircraft, { foreignKey: 'aircraft_id', as: 'aircraft' });
      }
    }
  }

  Engine.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    aircraft_id: { type: DataTypes.INTEGER, allowNull: false },
    make_model: { type: DataTypes.STRING(120), allowNull: false },
    serial_number: { type: DataTypes.STRING(60), allowNull: false },
    installed_date: { type: DataTypes.DATEONLY, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Engine',
    tableName: 'engines',
    underscored: true
  });

  return Engine;
};