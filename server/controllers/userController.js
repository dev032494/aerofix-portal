const userRepository = require("../repositories/userRepository");

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
    // ⚡ FIXED: Destructure the correct fields matching the payload context
    const {
      first_name,
      last_name,
      email,
      password,
      role,
      certificate_type,
      certificate_number,
      signature_pin,
    } = req.body;

    // Explicitly reconstruct the payload mapping exactly to your Sequelize database attributes
    const userPayload = {
      first_name,
      last_name,
      email,
      password_hash: password, // Maps raw string safely to your column
      role: role || "mechanic",
      certificate_type,
      certificate_number,
      signature_pin_hash: signature_pin, // Maps PIN securely to your column
      is_active: true,
    };

    const user = await userRepository.create(userPayload);

    // Sanitize response layout before sending to client
    const sanitizedUser = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      certificate_type: user.certificate_type,
      certificate_number: user.certificate_number,
    };

    res.status(201).json({
      status: "success",
      data: { user: sanitizedUser },
    });
  } catch (error) {
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
      certificate_type,
      certificate_number,
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
    user.certificate_type = certificate_type;
    user.certificate_number = certificate_number;

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
          certificate_type: user.certificate_type,
          certificate_number: user.certificate_number,
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
    if (!user || !user.validPassword(current_password)) {
      return res
        .status(401)
        .json({
          status: "fail",
          message: "Current session authentication signature invalid.",
        });
    }

    user.password_hash = new_password; // Storing directly to fit demo repository model architectures
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
