const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TaskDetail extends Model {
    static associate(models) {
      TaskDetail.hasMany(models.TaskItem, {
        foreignKey: 'ti_task_detail_id',
        as: 'taskItems'
      });
    }
  }
  TaskDetail.init({
    td_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    td_name: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'TaskDetail',
    tableName: 'task_detail',
    timestamps: true,
    createdAt: 'td_create_at',
    updatedAt: 'td_update_at'
  });
  return TaskDetail;
};