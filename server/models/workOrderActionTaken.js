'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WorkOrderActionTaken extends Model {
    static associate(models) {
      WorkOrderActionTaken.belongsTo(models.WorkOrderItem, {
        foreignKey: 'woat_work_order_item_id',
        as: 'workOrderItem'
      });
    }
  }

  WorkOrderActionTaken.init({
    woat_work_order_item_id: {
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