const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ManualItem extends Model {
    static associate(models) {
      ManualItem.belongsTo(models.ManualDetail, {
        foreignKey: 'mi_manual_detail_id',
        as: 'manualDetail'
      });
    }
  }
  ManualItem.init({
    mi_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    mi_manual_detail_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    mi_description: DataTypes.TEXT('long')
  }, {
    sequelize,
    modelName: 'ManualItem',
    tableName: 'manual_item',
    timestamps: true,
    createdAt: 'mi_create_at',
    updatedAt: 'mi_update_at'
  });
  return ManualItem;
};