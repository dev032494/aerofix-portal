'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WorkOrderItem extends Model {
    static associate(models) {
      // Associate back to WorkOrder
      WorkOrderItem.belongsTo(models.WorkOrder, {
        foreignKey: 'woi_work_order_id'
      });

      // FIX: Associate WorkOrderItem to WorkOrderList
      if (models.WorkOrderList) {
        WorkOrderItem.belongsTo(models.WorkOrderList, {
          foreignKey: 'woi_work_order_list_id',
          as: 'workOrderListDetails' // This must match the alias in your repository include
        });
      } else {
        console.warn("⚠️ WorkOrderList model not found during WorkOrderItem association.");
      }
    }
  }

  WorkOrderItem.init({
    woi_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    woi_work_order_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    woi_work_order_list_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'WorkOrderItem',
    tableName: 'work_order_items',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return WorkOrderItem;
};