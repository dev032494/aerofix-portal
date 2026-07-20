const userRepository = require("../repositories/userRepository");
const otpRepository = require('../repositories/otpRepository');
const logRepository = require('../repositories/userActivationLogRepository');
const activityLogRepository = require('../repositories/activityLogRepository'); // ⚡ ADDED: General Activity Log Repository
const { sequelize } = require('../models');
const { hashPassword, comparePassword } = require('../util/helper/bcryptHepler');

/**
 * Extract request context helpers
 */
const getReqContext = (req) => ({
  ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
  userAgent: req.headers['user-agent'],
  method: req.method,
  path: req.originalUrl,
  userId: req.user ? req.user.id : null
});

const getAllUsers = async (req, res, next) => {
  // #swagger.tags = ['User Registry Management']
  const ctx = getReqContext(req);
  try {
    const users = await userRepository.findAllSafe();

    // ⚡ LOG: Record view/query action in Activity Logs
    await activityLogRepository.createLog({
      userId: ctx.userId,
      action: 'USER_REGISTRY_VIEWED',
      module: 'USERS',
      description: `User registry roster queried. Total fetched: ${users.length} profiles.`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      method: ctx.method,
      path: ctx.path,
      statusCode: 200
    });

    res.status(200).json({
      status: "success",
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

const createNewUserProfile = async (req, res, next) => {
  // #swagger.tags = ['User Registry Management']
  const ctx = getReqContext(req);
  const t = await sequelize.transaction();

  try {
    const {
      first_name,
      middle_name,
      last_name,
      email,
      user_name,
      password,
      role,
      otp
    } = req.body;

    // 1. 🛡️ PRE-REGISTRATION SECURITY CHECK
    if (!otp) {
      await t.rollback();
      return res.status(400).json({
        status: "error",
        message: "The email verification security code (otp) parameter is required to provision an account."
      });
    }

    const isValidOtp = await otpRepository.verifyCode(email, otp);
    if (!isValidOtp) {
      await t.rollback();
      return res.status(422).json({
        status: "error",
        message: "The one-time verification passcode entered is incorrect, missing, or has expired."
      });
    }

    // 2. 🔐 CRYPTOGRAPHIC SECURITY LAYER
    const hashedPassword = await hashPassword(password);

    // 3. Reconstruct user payload
    const userPayload = {
      first_name,
      middle_name,
      last_name,
      email,
      user_name,
      password_hash: hashedPassword,
      role: role || "student",
      is_active: false,
      is_verified: true,
    };

    // 4. Complete database profile registration
    const user = await userRepository.create(userPayload, { transaction: t });

    // ⚡ Write to Activation Audit Logs
    await logRepository.createLog({
      userId: user.id,
      actionedBy: ctx.userId,
      action: 'rejected',
      notes: 'Initial account provisioned via OTP verification. Pending activation.'
    }, t);

    // ⚡ Write to System Activity Logs
    await activityLogRepository.createLog({
      userId: ctx.userId || user.id,
      action: 'USER_ACCOUNT_CREATED',
      module: 'USERS',
      description: `New user account created for [${user.first_name} ${user.last_name}] (${user.email}) with role [${user.role}].`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      method: ctx.method,
      path: ctx.path,
      statusCode: 201,
      payload: { targetUserId: user.id, email: user.email, role: user.role }
    }, t);

    await t.commit();

    // 5. Sanitize response layout
    const sanitizedUser = {
      id: user.id,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      email: user.email,
      user_name: user.user_name,
      role: user.role,
      is_active: user.is_active,
      is_verified: user.is_verified,
    };

    res.status(201).json({
      status: "success",
      message: "Profile provisioned successfully. Your institutional account access is verified and active.",
      data: { user: sanitizedUser },
    });
  } catch (error) {
    await t.rollback();
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      console.error('❌ Detailed Database Constraints Failed:', error.errors.map(e => ({
        field: e.path,
        message: e.message,
        invalidValue: e.value
      })));
    }
    next(error);
  }
};

const updateProfileData = async (req, res, next) => {
  // #swagger.tags = ['User Registry Management']
  const ctx = getReqContext(req);
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      is_active
    } = req.body;

    const user = await userRepository.findById(id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res
        .status(404)
        .json({ status: "fail", message: "No target crew record found." });
    }

    const previousState = user.is_active;

    // Overwrite fields if provided
    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (email !== undefined) user.email = email;
    if (is_active !== undefined) user.is_active = is_active;

    await user.save({ transaction: t });

    const decisiveAction = user.is_active ? 'approved' : 'rejected';
    const notesLog = is_active !== undefined && is_active !== previousState
      ? `Profile data modified and account active state changed to ${user.is_active}.`
      : `User profile fields (name/email) updated by operator.`;

    // ⚡ Write Activation Log
    await logRepository.createLog({
      userId: user.id,
      actionedBy: ctx.userId,
      action: decisiveAction,
      notes: notesLog
    }, t);

    // ⚡ Write Activity Log
    await activityLogRepository.createLog({
      userId: ctx.userId,
      action: 'USER_PROFILE_UPDATED',
      module: 'USERS',
      description: `Profile updated for target user ID: [${user.id}] (${user.email}).`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      method: ctx.method,
      path: ctx.path,
      statusCode: 200,
      payload: { targetUserId: user.id, updatedFields: { first_name, last_name, email, is_active } }
    }, t);

    await t.commit();

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
        },
      },
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * Dedicated endpoint controller to toggle or modify user active status
 */
const updateUserActiveStatus = async (req, res, next) => {
  // #swagger.tags = ['User Registry Management']
  const ctx = getReqContext(req);
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      await t.rollback();
      return res.status(400).json({
        status: "fail",
        message: "The 'is_active' parameter must be a boolean value (true or false)."
      });
    }

    const user = await userRepository.findById(id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({
        status: "fail",
        message: "User record not found."
      });
    }

    user.is_active = is_active;
    await user.save({ transaction: t });

    // ⚡ Write Activation Log
    await logRepository.createLog({
      userId: user.id,
      actionedBy: ctx.userId,
      action: is_active ? 'approved' : 'rejected',
      notes: `User status explicitly ${is_active ? 'activated (approved)' : 'deactivated (rejected)'} via registry toggle.`
    }, t);

    // ⚡ Write Activity Log
    await activityLogRepository.createLog({
      userId: ctx.userId,
      action: is_active ? 'USER_ACCOUNT_ACTIVATED' : 'USER_ACCOUNT_DEACTIVATED',
      module: 'USERS',
      description: `Account active state toggled to [${is_active}] for user ID: [${user.id}] (${user.email}).`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      method: ctx.method,
      path: ctx.path,
      statusCode: 200,
      payload: { targetUserId: user.id, is_active }
    }, t);

    await t.commit();

    res.status(200).json({
      status: "success",
      message: `User activation status updated successfully to ${is_active}.`,
      data: {
        user: {
          id: user.id,
          email: user.email,
          is_active: user.is_active
        }
      }
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * Validates active passphrase context string before rewriting cryptographic password records
 */
const updateAccountPassword = async (req, res, next) => {
  // #swagger.tags = ['User Registry Management']
  const ctx = getReqContext(req);
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;

    const user = await userRepository.findById(id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res
        .status(404)
        .json({ status: "fail", message: "User record not found." });
    }

    const isCurrentPasswordCorrect = await comparePassword(current_password, user.password_hash);
    if (!isCurrentPasswordCorrect) {
      await t.rollback();

      // ⚡ Write Failed Attempt Activity Log
      await activityLogRepository.createLog({
        userId: ctx.userId || user.id,
        action: 'PASSWORD_CHANGE_FAILED',
        module: 'USERS',
        description: `Failed password change attempt for user ID: [${user.id}] - Incorrect current password.`,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
        method: ctx.method,
        path: ctx.path,
        statusCode: 401
      });

      return res
        .status(401)
        .json({
          status: "fail",
          message: "Current session authentication signature invalid.",
        });
    }

    user.password_hash = await hashPassword(new_password);
    await user.save({ transaction: t });

    // ⚡ Write Activation Log
    await logRepository.createLog({
      userId: user.id,
      actionedBy: ctx.userId,
      action: user.is_active ? 'approved' : 'rejected',
      notes: 'Account security credentials / password updated successfully.'
    }, t);

    // ⚡ Write Success Activity Log
    await activityLogRepository.createLog({
      userId: ctx.userId || user.id,
      action: 'PASSWORD_CHANGE_SUCCESS',
      module: 'USERS',
      description: `Password updated successfully for user ID: [${user.id}] (${user.email}).`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      method: ctx.method,
      path: ctx.path,
      statusCode: 200,
      payload: { targetUserId: user.id }
    }, t);

    await t.commit();

    res.status(200).json({
      status: "success",
      message: "Cryptographic credentials rolled over cleanly.",
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createNewUserProfile,
  updateProfileData,
  updateUserActiveStatus,
  updateAccountPassword,
};