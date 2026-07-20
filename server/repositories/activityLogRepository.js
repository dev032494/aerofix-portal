const { ActivityLog, User, Sequelize } = require('../models');
const { Op } = Sequelize;

class ActivityLogRepository {
  /**
   * Log an activity record
   */
  async createLog(data, transaction = null) {
    return await ActivityLog.create(data, { transaction });
  }

  /**
   * Find logs with filtering and pagination
   */
  async findLogs({ limit = 10, offset = 0, module, action, userId, startDate, endDate, search }) {
    const where = {};

    if (module) where.module = module;
    if (action) where.action = action;
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate + 'T00:00:00');
      if (endDate) where.createdAt[Op.lte] = new Date(endDate + 'T23:59:59');
    }

    if (search) {
      where[Op.or] = [
        { action: { [Op.like]: `%${search}%` } },
        { module: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { ipAddress: { [Op.like]: `%${search}%` } }
      ];
    }

    return await ActivityLog.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['createdAt', 'DESC']],
      distinct: true,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email', 'role']
        }
      ]
    });
  }

  /**
   * Get distinct modules for UI filters
   */
  async getModules() {
    const logs = await ActivityLog.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('module')), 'module']],
      raw: true
    });
    return logs.map((l) => l.module).filter(Boolean);
  }
}

module.exports = new ActivityLogRepository();