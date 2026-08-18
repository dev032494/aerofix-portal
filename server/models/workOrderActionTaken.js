'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WorkOrderActionTaken extends Model {
    static associate(models) {
      WorkOrderActionTaken.belongsTo(models.WorkOrder, {
        foreignKey: 'woat_work_order_id',
        targetKey: 'wo_work_order_number',
        as: 'workOrder'
      });
    }
  }

  WorkOrderActionTaken.init({
    woat_work_order_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    woat_description: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'WorkOrderActionTaken',
    tableName: 'work_order_action_taken'
  });

  return WorkOrderActionTaken;
};