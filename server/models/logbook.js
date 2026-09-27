'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Logbook extends Model {
    static associate(models) {
      // Define association here if linking to WorkOrder
      Logbook.belongsTo(models.WorkOrder, {
        foreignKey: 'work_order_id',
        targetKey: 'wo_work_order_number', // Change to 'id' if your work orders use numeric IDs
        as: 'workOrder'
      });
    }
  }

  Logbook.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    work_order_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: 'work_orders',
        key: 'wo_work_order_number'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    details: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },

  }, {
    sequelize,
    modelName: 'Logbook',
    tableName: 'logbooks',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Logbook;
};