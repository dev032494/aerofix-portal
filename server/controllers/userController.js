const userRepository = require("../repositories/userRepository");
const otpRepository = require('../repositories/otpRepository');
// const bcrypt = require('bcrypt'); // ⚡ ADDED: Direct bcrypt import for secure hashing
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
  try {
    // Destructure properties from incoming request body, including the input 'otp'
    const {
      first_name,
      middle_name,
      last_name,
      email,
      user_name,
      password,
      role,
      otp // ⚡ ADDED: The 6-digit security token entered by the user
    } = req.body;

    // 1. 🛡️ PRE-REGISTRATION SECURITY CHECK
    if (!otp) {
      return res.status(400).json({
        status: "error",
        message: "The email verification security code (otp) parameter is required to provision an account."
      });
    }

    const isValidOtp = await otpRepository.verifyCode(email, otp);
    if (!isValidOtp) {
      return res.status(422).json({
        status: "error",
        message: "The one-time verification passcode entered is incorrect, missing, or has expired."
      });
    }

    // 2. 🔐 CRYPTOGRAPHIC SECURITY LAYER
    // Securely hash the password before sending it to the database sequence
    const hashedPassword = await hashPassword(password);

    // 3. Reconstruct variables using snake_case properties
    const userPayload = {
      first_name,
      middle_name, // Maps safely to database schema parameters
      last_name,
      email,
      user_name,
      password_hash: hashedPassword, // ⚡ UPDATED: Maps SECURE hash to the database column
      role: role || "student",
      is_active: true,
      is_verified: true, // ⚡ UPDATED: Automatically true since they successfully passed the OTP checkpoint
    };

    // 4. Complete database profile registration now that authentication clearance is verified
    const user = await userRepository.create(userPayload);

    // 5. Sanitize response layout before sending to client
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

    // 6. Return clean system success context
    res.status(201).json({
      status: "success",
      message: "Profile provisioned successfully. Your institutional account access is verified and active.",
      data: { user: sanitizedUser },
    });
  } catch (error) {
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
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
    } = req.body;

    const user = await userRepository.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "No target crew record found." });
    }

    // Overwrite fields
    user.first_name = first_name;
    user.last_name = last_name;
    user.email = email;

    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validates active passphrase context string before rewriting cryptographic password records
 */
const updateAccountPassword = async (req, res, next) => {
  // #swagger.tags = ['User Registry Management']
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;

    const user = await userRepository.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User record not found." });
    }

    // ⚡ UPDATED: Perform a secure, asynchronous bcrypt compare check against the database hash
    const isCurrentPasswordCorrect = await bcrypt.compare(current_password, user.password_hash);
    if (!isCurrentPasswordCorrect) {
      return res
        .status(401)
        .json({
          status: "fail",
          message: "Current session authentication signature invalid.",
        });
    }

    // ⚡ UPDATED: Hash the new password before overwriting and committing to the database
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    user.password_hash = await bcrypt.hash(new_password, salt);
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Cryptographic credentials rolled over cleanly.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createNewUserProfile,
  updateProfileData,
  updateAccountPassword,
};