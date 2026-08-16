'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      if (models.TaskCard) {
        this.hasMany(models.TaskCard, { foreignKey: 'mechanic_user_id', as: 'assignedTasks' });
        this.hasMany(models.TaskCard, { foreignKey: 'inspector_user_id', as: 'inspectedTasks' });
      }
      if (models.TaskCardStep) {
        this.hasMany(models.TaskCardStep, { foreignKey: 'signed_by_user_id', as: 'signedSteps' });
      }

      // WORK ORDERS ASSOCIATIONS
      if (models.WorkOrder) {
        this.hasMany(models.WorkOrder, { foreignKey: 'wo_instructor', as: 'instructedWorkOrders' });
        this.hasMany(models.WorkOrder, { foreignKey: 'wo_approve_by', as: 'approvedWorkOrders' });
      }

      // FIX: Use sourceKey: 'student_id' so it links properly with WorkOrderPersonnel's targetKey
      if (models.WorkOrderPersonnel) {
        this.hasMany(models.WorkOrderPersonnel, { 
          foreignKey: 'wop_user_id', 
          sourceKey: 'student_id', 
          as: 'workOrderAssignments' 
        });
      }
    }
  }

  User.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    student_id: { type: DataTypes.STRING(120), allowNull: true, unique: true },
    first_name: { type: DataTypes.STRING(120), allowNull: false },
    middle_name: { type: DataTypes.STRING(120), allowNull: false },
    last_name: { type: DataTypes.STRING(120), allowNull: false },
    section_year: { type: DataTypes.STRING(120), allowNull: true },
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    user_name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    password_hash: { type: DataTypes.TEXT, allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'student', 'instructor', 'developer'), allowNull: false, defaultValue: 'student' },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    is_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    last_login_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true
  });

  User.prototype.validPassword = function (password) {
    return this.password_hash === password;
  };

  return User;
};