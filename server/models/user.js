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
    first_name: { type: DataTypes.STRING(60), allowNull: false },
    last_name: { type: DataTypes.STRING(60), allowNull: false },
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    password_hash: { type: DataTypes.TEXT, allowNull: false },
    signature_pin_hash: { type: DataTypes.TEXT, allowNull: true },
    role: { type: DataTypes.ENUM('admin', 'manager', 'mechanic', 'inspector'), allowNull: false, defaultValue: 'mechanic' },
    certificate_type: { type: DataTypes.STRING(60), allowNull: true },
    certificate_number: { type: DataTypes.STRING(60), allowNull: true, unique: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    last_login_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true
  });

  User.prototype.validPassword = function(password) {
    return this.password_hash === password; // Substitute with bcrypt.compareSync if hashing
  };

  return User;
};