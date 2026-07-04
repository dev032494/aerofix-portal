// models/otp.js
const { Model, DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
  class Otp extends Model {
    /**
     * Check instance validity directly on the data object.
     */
    isValid() {
      return !this.is_verified && this.expires_at > new Date();
    }
  }

  Otp.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Otp',
    tableName: 'otps',
    underscored: true, // Auto-maps camelCase to created_at/updated_at fields
    scopes: {
      active: {
        where: {
          is_verified: false,
          expires_at: { [Op.gt]: new Date() }
        }
      }
    }
  });

  return Otp;
};