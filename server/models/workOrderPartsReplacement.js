'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WorkOrderPartsReplacement extends Model {
    static associate(models) {
      WorkOrderPartsReplacement.belongsTo(models.WorkOrder, {
        foreignKey: 'wopr_work_order_id',
        as: 'workOrder'
      });
    }
  }

  WorkOrderPartsReplacement.init({
    wopr_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    wopr_work_order_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    wopr_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    wopr_nomenclature: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    wopr_part_number: {
      type: DataTypes.STRING(300),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'WorkOrderPartsReplacement',
    tableName: 'work_order_parts_replacement'
  });

  return WorkOrderPartsReplacement;
};