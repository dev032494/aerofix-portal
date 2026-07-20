const logRepository = require('../repositories/userActivationLogRepository');
const { User, sequelize } = require('../models');

class UserActivationLogController {
  /**
   * POST /api/activation-logs
   * Approves or rejects a user activation request and writes to the audit log
   */
  async processApproval(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { userId, action, notes } = req.body;
      const actionedBy = req.user ? req.user.id : null; // Extracted from auth middleware

      if (!['approved', 'rejected'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action. Must be approved or rejected.' });
      }

      // 1. Verify target user exists
      const targetUser = await User.findByPk(userId, { transaction: t });
      if (!targetUser) {
        await t.rollback();
        return res.status(404).json({ message: 'Target user record not found.' });
      }

      // 2. Perform operational updates on the user record
      if (action === 'approved') {
        targetUser.isValidated = true;
        targetUser.isActive = true;
      } else if (action === 'rejected') {
        targetUser.isValidated = false;
        targetUser.isActive = false;
      }
      await targetUser.save({ transaction: t });

      // 3. Create audit log entry
      const logEntry = await logRepository.createLog(
        { userId, actionedBy, action, notes },
        t
      );

      await t.commit();

      return res.status(201).json({
        message: `User status successfully updated to: ${action}.`,
        log: logEntry
      });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  /**
   * GET /api/activation-logs
   * Retrieve global activation logs across all users
   */
  async getGlobalHistory(req, res, next) {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const logs = await logRepository.findGlobalHistory(limit, offset);

      return res.status(200).json({
        totalRecords: logs.count,
        history: logs.rows,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserActivationLogController();