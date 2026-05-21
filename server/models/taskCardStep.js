const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TaskCardStep extends Model {
    static associate(models) {
      if (models.TaskCard) this.belongsTo(models.TaskCard, { foreignKey: 'task_card_id', as: 'taskCard' });
      if (models.User) this.belongsTo(models.User, { foreignKey: 'signed_by_user_id', as: 'signingUser' });
    }
  }

  TaskCardStep.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    task_card_id: { type: DataTypes.INTEGER, allowNull: false },
    step_order: { type: DataTypes.INTEGER, allowNull: false },
    instruction: { type: DataTypes.TEXT, allowNull: false },
    torque_spec: { type: DataTypes.STRING(60), allowNull: true },
    is_completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    signed_by_user_id: { type: DataTypes.INTEGER, allowNull: true },
    inspector_note: { type: DataTypes.TEXT, allowNull: true },
    completed_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    modelName: 'TaskCardStep',
    tableName: 'task_card_steps',
    underscored: true
  });

  return TaskCardStep;
};