const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TaskCardPart extends Model {
    static associate(models) {
      if (models.TaskCard) {
        this.belongsTo(models.TaskCard, { foreignKey: 'task_card_id', as: 'taskCard' });
      }
    }
  }

  TaskCardPart.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    task_card_id: { type: DataTypes.INTEGER, allowNull: false },
    part_number: { type: DataTypes.STRING(60), allowNull: false },
    description: { type: DataTypes.STRING(300), allowNull: true },
    quantity_required: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 1.00 },
    ipc_reference: { type: DataTypes.STRING(60), allowNull: true },
    is_issued: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    sequelize,
    modelName: 'TaskCardPart',
    tableName: 'task_card_parts',
    underscored: true
  });

  return TaskCardPart;
};