const userRepository = require("../repositories/userRepository");
const otpRepository = require('../repositories/otpRepository');
const logRepository = require('../repositories/userActivationLogRepository'); // ⚡ ADDED: Audit trail repository
const { User, sequelize } = require('../models'); // ⚡ ADDED: Sequelize for transactions
const { hashPassword, comparePassword } = require('../util/helper/bcryptHepler');

const getAllUsers = async (req, res, next) => {
  // #swagger.tags = ['User Registry Management']
  try {
    const users = await userRepository.findAllSafe();
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
    const actionedBy = req.user ? req.user.id : null;

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

    // 3. Reconstruct variables using snake_case properties
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

    // 4. Complete database profile registration within transaction
    const user = await userRepository.create(userPayload, { transaction: t });

    // ⚡ ADDED: Write initial account creation log entry
    await logRepository.createLog({
      userId: user.id,
      actionedBy,
      action: 'rejected', // Accounts start inactive until approved/activated
      notes: 'Initial account provisioned via OTP verification. Pending activation.'
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

    // 6. Return success context
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
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      is_active
    } = req.body;
    const actionedBy = req.user ? req.user.id : null;

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

    // ⚡ ADDED: Create audit log if activation state changed or profile updated
    const decisiveAction = user.is_active ? 'approved' : 'rejected';
    const notesLog = is_active !== undefined && is_active !== previousState
      ? `Profile data modified and account active state changed to ${user.is_active}.`
      : `User profile fields (name/email) updated by operator.`;

    await logRepository.createLog({
      userId: user.id,
      actionedBy,
      action: decisiveAction,
      notes: notesLog
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
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const actionedBy = req.user ? req.user.id : null;

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

    // ⚡ ADDED: Log activation status transition
    await logRepository.createLog({
      userId: user.id,
      actionedBy,
      action: is_active ? 'approved' : 'rejected',
      notes: `User status explicitly ${is_active ? 'activated (approved)' : 'deactivated (rejected)'} via registry toggle.`
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
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;
    const actionedBy = req.user ? req.user.id : null;

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
      return res
        .status(401)
        .json({
          status: "fail",
          message: "Current session authentication signature invalid.",
        });
    }

    user.password_hash = await hashPassword(new_password);
    await user.save({ transaction: t });

    // ⚡ ADDED: Audit trail log for credential changes
    await logRepository.createLog({
      userId: user.id,
      actionedBy,
      action: user.is_active ? 'approved' : 'rejected',
      notes: 'Account security credentials / password updated successfully.'
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