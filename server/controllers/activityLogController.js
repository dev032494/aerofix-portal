const activityLogRepository = require('../repositories/activityLogRepository');

const getLogs = async (req, res, next) => {
  // #swagger.tags = ['System Activity Logs']
  try {
    const {
      limit = 10,
      offset = 0,
      module,
      action,
      userId,
      startDate,
      endDate,
      search
    } = req.query;

    const result = await activityLogRepository.findLogs({
      limit,
      offset,
      module,
      action,
      userId,
      startDate,
      endDate,
      search
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalRecords: result.count,
        logs: result.rows,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getModules = async (req, res, next) => {
  // #swagger.tags = ['System Activity Logs']
  try {
    const modules = await activityLogRepository.getModules();
    res.status(200).json({
      status: 'success',
      data: { modules }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manual logging endpoint (Optional)
 */
const logActivity = async (req, res, next) => {
  // #swagger.tags = ['System Activity Logs']
  try {
    const { action, module, description, payload } = req.body;

    const log = await activityLogRepository.createLog({
      userId: req.user ? req.user.id : null,
      action,
      module,
      description,
      payload,
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode
    });

    res.status(201).json({
      status: 'success',
      data: { log }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLogs,
  getModules,
  logActivity
};