'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserActivationLog extends Model {
    static associate(models) {
      // Target User association (matches as: 'targetUser' in repository)
      this.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'targetUser'
      });

      // Operator/Admin association (matches as: 'operator' in repository)
      this.belongsTo(models.User, {
        foreignKey: 'actionedBy',
        targetKey: 'id',
        as: 'operator'
      });
    }
  }

  UserActivationLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
      },
      actionedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'actioned_by'
      },
      action: {
        type: DataTypes.ENUM('approved', 'rejected'),
        allowNull: false
      },
      notes: {
        type: DataTypes.TEXT,
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
      modelName: 'UserActivationLog',
      tableName: 'user_activation_logs',
      underscored: true,
      timestamps: true,
      updatedAt: false, // Disables updated_at since logs are insert-only
      createdAt: 'created_at'
    }
  );

  return UserActivationLog;
};