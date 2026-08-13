'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WorkOrderList extends Model {}

  WorkOrderList.init({
    wol_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    wol_description: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    wol_create_by: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    wol_create_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'WorkOrderList',
    tableName: 'work_order_list',
    timestamps: false
  });

  return WorkOrderList;
};