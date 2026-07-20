'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ActivityLog extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'user'
      });
    }
  }

  ActivityLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'user_id'
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      module: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'ip_address'
      },
      userAgent: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'user_agent'
      },
      method: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      path: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      statusCode: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'status_code'
      },
      payload: {
        type: DataTypes.JSON,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'ActivityLog',
      tableName: 'activity_logs',
      underscored: true,
      timestamps: true,
      updatedAt: false // Insert-only table
    }
  );

  return ActivityLog;
};