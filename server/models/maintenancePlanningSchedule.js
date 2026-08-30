// --- 2. Sequelize Model ---
// models/maintenancePlanningSchedule.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MaintenancePlanningSchedule extends Model {
    static associate(models) {
      // Define associations here if needed, e.g.:
      // this.belongsTo(models.TaskDetail, { foreignKey: 'mps_task_detail_id', as: 'taskDetail' });
      // this.belongsTo(models.ManualDetail, { foreignKey: 'mps_manual_detail_id', as: 'manualDetail' });
    }
  }

  MaintenancePlanningSchedule.init(
    {
      mps_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      mps_aircraft_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      mps_task_detail_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      mps_manual_detail_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      mps_recuring_month: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      mps_create_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      mps_update_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'MaintenancePlanningSchedule',
      tableName: 'maintenance_planning_schedule',
      timestamps: true,
      createdAt: 'mps_create_at',
      updatedAt: 'mps_update_at'
    }
  );

  return MaintenancePlanningSchedule;
};