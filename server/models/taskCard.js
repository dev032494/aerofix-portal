const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TaskCard extends Model {
    static associate(models) {
      if (models.WorkOrder) this.belongsTo(models.WorkOrder, { foreignKey: 'work_order_id', as: 'workOrder' });
      if (models.User) {
        this.belongsTo(models.User, { foreignKey: 'mechanic_user_id', as: 'assignedMechanic' });
        this.belongsTo(models.User, { foreignKey: 'inspector_user_id', as: 'assignedInspector' });
      }
      if (models.TaskCardPart) this.hasMany(models.TaskCardPart, { foreignKey: 'task_card_id', as: 'parts' });
      if (models.TaskCardStep) this.hasMany(models.TaskCardStep, { foreignKey: 'task_card_id', as: 'steps' });
    }
  }

  TaskCard.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    work_order_id: { type: DataTypes.INTEGER, allowNull: false },
    task_code: { type: DataTypes.STRING(60), allowNull: false },
    title: { type: DataTypes.STRING(60), allowNull: false },
    ata_chapter: { type: DataTypes.INTEGER, allowNull: true },
    reference_manual: { type: DataTypes.STRING(60), allowNull: true },
    estimated_hours: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0.00 },
    status: { type: DataTypes.ENUM('pending', 'in_progress', 'signed_off'), allowNull: false, defaultValue: 'pending' },
    mechanic_user_id: { type: DataTypes.INTEGER, allowNull: true },
    inspector_user_id: { type: DataTypes.INTEGER, allowNull: true },
    completed_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    modelName: 'TaskCard',
    tableName: 'task_cards',
    underscored: true
  });

  return TaskCard;
};