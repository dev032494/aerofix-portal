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
    }
  }

  User.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    student_id: { type: DataTypes.STRING(20), allowNull: true, unique: true },
    first_name: { type: DataTypes.STRING(120), allowNull: false },
    middle_name: { type: DataTypes.STRING(120), allowNull: false },
    last_name: { type: DataTypes.STRING(120), allowNull: false },
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
    return this.password_hash === password; // Substitute with bcrypt.compareSync if hashing
  };

  return User;
};