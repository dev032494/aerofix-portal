const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ManualDetail extends Model {
    static associate(models) {
      ManualDetail.hasMany(models.ManualItem, {
        foreignKey: 'mi_manual_detail_id',
        as: 'manualItems'
      });
    }
  }
  ManualDetail.init({
    md_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    md_name: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ManualDetail',
    tableName: 'manual_detail',
    timestamps: true,
    createdAt: 'md_create_at',
    updatedAt: 'md_update_at'
  });
  return ManualDetail;
};