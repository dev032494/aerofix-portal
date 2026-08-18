'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WorkOrderPersonnel extends Model {
    static associate(models) {
      // Connect back to the WorkOrder
      WorkOrderPersonnel.belongsTo(models.WorkOrder, {
        foreignKey: 'wop_work_order_id',
        as: 'workOrder'
      });

      // FIX: Explicitly defined foreignKey and targeted 'student_id'
      if (models.User) {
        WorkOrderPersonnel.belongsTo(models.User, {
          foreignKey: 'wop_user_id', // The column in work_order_personel holding the student ID value
          targetKey: 'student_id',  // The unique column in the users table it joins against
          as: 'user'                // Must match your query alias
        });
      }
    }
  }

  WorkOrderPersonnel.init({
    wop_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    wop_work_order_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    wop_user_id: {
      type: DataTypes.INTEGER, 
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'WorkOrderPersonnel',
    tableName: 'work_order_personel', // Note: Make sure your actual database table is spelled with one 'n' like this!
    underscored: true
  });

  return WorkOrderPersonnel;
};