const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TaskItem extends Model {
    static associate(models) {
      TaskItem.belongsTo(models.TaskDetail, {
        foreignKey: 'ti_task_detail_id',
        as: 'taskDetail'
      });
    }
  }
  TaskItem.init({
    ti_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    ti_task_detail_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    ti_description: DataTypes.TEXT('long')
  }, {
    sequelize,
    modelName: 'TaskItem',
    tableName: 'task_item',
    timestamps: true,
    createdAt: 'ti_create_at',
    updatedAt: 'ti_update_at'
  });
  return TaskItem;
};