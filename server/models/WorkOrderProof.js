'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class WorkOrderProof extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Belongs to WorkOrder (assumes primary key/unique key on WorkOrder is wo_work_order_number or id)
      if (models.WorkOrder) {
        WorkOrderProof.belongsTo(models.WorkOrder, {
          foreignKey: 'work_order_number',
          targetKey: 'wo_work_order_number', // Adjust targetKey if your WorkOrder model uses a different key (e.g., 'id')
          as: 'workOrder',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
      }
    }
  }

  WorkOrderProof.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      workOrderNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'work_order_number',
        comment: 'Foreign key referencing work_orders table'
      },
      filePath: {
        type: DataTypes.STRING(550),
        allowNull: false,
        field: 'file_path',
        comment: 'Relative web path (e.g., /work_order/WO-101/proof-123.jpg)'
      },
      fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'file_name',
        comment: 'Stored file name on disk'
      },
      caption: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Optional image description or label'
      },
      uploadedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'uploaded_at'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at'
      }
    },
    {
      sequelize,
      modelName: 'WorkOrderProof',
      tableName: 'work_order_proofs',
      timestamps: true, // Enables created_at & updated_at
      underscored: true // Maps camelCase attributes to snake_case DB columns
    }
  );

  return WorkOrderProof;
};