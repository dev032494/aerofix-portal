'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WorkOrder extends Model {
    static associate(models) {
      // 1. Check and Associate Personnel
      if (models.WorkOrderPersonnel) {
        WorkOrder.hasMany(models.WorkOrderPersonnel, {
          foreignKey: 'wop_work_order_id',
          as: 'personnel'
        });
      } else {
        console.warn("⚠️ WorkOrderPersonnel model not found during association.");
      }

      // 2. Check and Associate Items
      if (models.WorkOrderItem) {
        WorkOrder.hasMany(models.WorkOrderItem, {
          foreignKey: 'woi_work_order_id',
          as: 'items'
        });
      } else {
        console.warn("⚠️ WorkOrderItem model not found during association.");
      }

      // 3. Check and Associate Parts Replacement
      if (models.WorkOrderPartsReplacement) {
        WorkOrder.hasMany(models.WorkOrderPartsReplacement, {
          foreignKey: 'wopr_work_order_id',
          sourceKey: 'wo_work_order_number',
          as: 'partsReplacement' // Updated to match viewReport alias
        });
      }

      // 4. Check and Associate Action Taken
      if (models.WorkOrderActionTaken) {
        WorkOrder.hasOne(models.WorkOrderActionTaken, {
          foreignKey: 'woat_work_order_id',
          sourceKey: 'wo_work_order_number',
          as: 'actionTaken'
        });
      }

      // 5. Check and Associate Return Service / Return Slip
      if (models.WorkOrderReturnService) {
        WorkOrder.hasOne(models.WorkOrderReturnService, {
          foreignKey: 'wors_work_order_id',
          sourceKey: 'wo_work_order_number',
          as: 'returnSlip'
        });
      }

      // 6. Associate the WorkOrder directly to the User model for Instructors/Approvers
      if (models.User) {
        WorkOrder.belongsTo(models.User, {
          foreignKey: 'wo_instructor',
          targetKey: 'id',
          as: 'instructor'
        });

        WorkOrder.belongsTo(models.User, {
          foreignKey: 'wo_approve_by',
          targetKey: 'id',
          as: 'approver'
        });
      }
    }
  }

  WorkOrder.init({
    wo_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    wo_work_order_number: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    wo_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    wo_instructor: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    wo_status: {
      type: DataTypes.ENUM('active', 'inactive', 'ongoing', 'complete'),
      defaultValue: 'active'
    },
    wo_approve_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    wo_approve_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    wo_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    wo_updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'WorkOrder',
    tableName: 'work_order',
    timestamps: true,
    underscored: false,
    createdAt: 'wo_created_at',
    updatedAt: 'wo_updated_at'
  });

  return WorkOrder;
};