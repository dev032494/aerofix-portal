const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Instructor extends Model {
    static associate(models) {
      // Define associations here when needed
      // Example:
      // if (models.Course) {
      //   this.hasMany(models.Course, { foreignKey: 'instructor_id', as: 'courses' });
      // }
    }
  }

  Instructor.init({
    i_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    i_first_name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    i_middle_name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    i_last_name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    i_license_number: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    i_create_by: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    i_create_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    i_status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Instructor',
    tableName: 'instructor',
    timestamps: false // Kept false as custom creation fields are used
  });

  return Instructor;
};