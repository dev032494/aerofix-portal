const { UserActivationLog, User } = require('../models');

class UserActivationLogRepository {
  /**
   * Log an intake validation action
   * @param {Object} logData - { userId, actionedBy, action, notes }
   * @param {Object} [transaction=null] - Optional Sequelize transaction object
   */
  async createLog({ userId, actionedBy, action, notes }, transaction = null) {
    return await UserActivationLog.create(
      { userId, actionedBy, action, notes },
      { transaction }
    );
  }

  /**
   * Fetch global activation audit logs across all users
   * @param {number} [limit=10] - Number of records to return
   * @param {number} [offset=0] - Number of records to skip
   */
  async findGlobalHistory(limit = 10, offset = 0) {
    return await UserActivationLog.findAndCountAll({
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['createdAt', 'DESC']], // Matches the JS model property 'createdAt'
      distinct: true, // Prevents duplicate counts caused by eager-loaded JOINs
      include: [
        {
          model: User,
          as: 'operator',
          attributes: ['id', 'first_name', 'last_name', 'role']
        },
        {
          model: User,
          as: 'targetUser',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
  }

  /**
   * Find activation logs for a specific target user ID
   * @param {number|string} userId - Target user's primary key
   * @param {number} [limit=10] - Number of records to return
   * @param {number} [offset=0] - Number of records to skip
   */
  async findByUserId(userId, limit = 10, offset = 0) {
    return await UserActivationLog.findAndCountAll({
      where: { userId },
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['createdAt', 'DESC']], // Matches the JS model property 'createdAt'
      distinct: true, // Prevents duplicate counts caused by eager-loaded JOINs
      include: [
        {
          model: User,
          as: 'operator',
          attributes: ['id', 'first_name', 'last_name', 'role']
        },
        {
          model: User,
          as: 'targetUser',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
  }

  /**
   * Find a single log entry by its primary key ID
   * @param {number|string} id - Activation log entry primary key
   */
  async findById(id) {
    return await UserActivationLog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'operator',
          attributes: ['id', 'first_name', 'last_name', 'role']
        },
        {
          model: User,
          as: 'targetUser',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });
  }
}

module.exports = new UserActivationLogRepository();