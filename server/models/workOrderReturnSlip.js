'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WorkOrderReturnService extends Model {
    static associate(models) {
      // Define association with WorkOrder model
      WorkOrderReturnService.belongsTo(models.WorkOrder, {
        foreignKey: 'wors_work_order_id',
        targetKey :'wo_work_order_number',
        as: 'returnSlip',
      });
    }
  }

  WorkOrderReturnService.init(
    {
      wors_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      wors_work_order_id: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      wors_aircraft_discrepancy: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
      },
      wors_corrective_action: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
      },
      wors_created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      wors_updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'WorkOrderReturnService',
      tableName: 'work_order_return_service',
      timestamps: true,
      createdAt: 'wors_created_at',
      updatedAt: 'wors_updated_at'
    }
  );

  return WorkOrderReturnService;
};