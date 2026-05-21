const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class WorkOrder extends Model {
    static associate(models) {
      if (models.Aircraft) {
        this.belongsTo(models.Aircraft, { foreignKey: 'aircraft_id', as: 'aircraft' });
      }
      if (models.TaskCard) {
        this.hasMany(models.TaskCard, { foreignKey: 'work_order_id', as: 'taskCards' });
      }
    }
  }

  WorkOrder.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    aircraft_id: { type: DataTypes.INTEGER, allowNull: false },
    work_order_number: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    status: { type: DataTypes.ENUM('open', 'in_progress', 'closed'), allowNull: false, defaultValue: 'open' },
    opened_date: { type: DataTypes.DATEONLY, allowNull: false },
    closed_date: { type: DataTypes.DATEONLY, allowNull: true }
  }, {
    sequelize,
    modelName: 'WorkOrder',
    tableName: 'work_orders',
    underscored: true
  });

  return WorkOrder;
};