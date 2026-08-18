const instructorRepository = require('../repositories/instructorRepository');
const { sequelize } = require('../models');
const { hashPassword, comparePassword } = require('../util/helper/bcryptHepler');
const logRepository = require('../repositories/userActivationLogRepository');
const activityLogRepository = require('../repositories/activityLogRepository');
const userRepository = require("../repositories/userRepository");

const getReqContext = (req) => ({
  ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
  userAgent: req.headers['user-agent'],
  method: req.method,
  path: req.originalUrl,
  userId: req.user ? req.user.id : null
});

exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await instructorRepository.findAll();
    res.status(200).json({
      success: true,
      instructors
    });
  } catch (error) {
    console.error(`Error fetching instructors: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getInstructorById = async (req, res) => {
  try {
    const instructor = await instructorRepository.findById(req.params.id);
    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }
    res.status(200).json({
      success: true,
      instructor
    });
  } catch (error) {
    console.error(`Error fetching instructor by ID: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createInstructor = async (req, res) => {
  try {
    const { i_first_name, i_middle_name, i_last_name, i_license_number, i_create_by } = req.body;
    const i_create_at = new Date();
    const ctx = getReqContext(req);
    const t = await sequelize.transaction();

    // Check if license number is already in use
    const existing = await instructorRepository.findByLicenseNumber(i_license_number);
    if (existing) {
      console.warn(`Attempt to create instructor with existing license number: ${i_license_number}`);
      return res.status(400).json({
        success: false,
        error: 'An instructor with this license number already exists.'
      });
    }

    const newInstructor = await instructorRepository.create({
      i_first_name,
      i_middle_name,
      i_last_name,
      i_license_number,
      i_create_by,
      i_create_at,
    }, { transaction: t });

    const hashedPassword = await hashPassword(`${i_license_number}`); // Example password hashing logic
    const user_name = `${i_first_name.toLowerCase().slice(0, 1)}.${i_last_name.toLowerCase()}`;
    const section_year = 'N/A';
    const email = 'N/A'
    const first_name = i_first_name;
    const middle_name = i_middle_name;
    const last_name = i_last_name;
    const student_id = i_license_number;

    const userPayload = {
      student_id,
      section_year,
      first_name,
      middle_name,
      last_name,
      email,
      user_name,
      password_hash: hashedPassword,
      role: "instructor",
      is_active: true,
      is_verified: true,
    };

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

    res.status(201).json({
      success: true,
      instructor: newInstructor
    });
  } catch (error) {
    console.error(`Error creating instructor: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateInstructor = async (req, res) => {
  try {
    const updatedInstructor = await instructorRepository.update(req.params.id, req.body);
    if (!updatedInstructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }
    res.status(200).json({
      success: true,
      instructor: updatedInstructor
    });
  } catch (error) {
    console.error(`Error updating instructor: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteInstructor = async (req, res) => {
  try {
    const deleted = await instructorRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }
    res.status(200).json({ success: true, message: 'Instructor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ⚡ STATUS TOGGLE CONTROLLER METHOD (Invoked by router.patch('/:id/status'))
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { i_status } = req.body;

    const updatedInstructor = await instructorRepository.updateStatus(id, i_status);
    if (!updatedInstructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Instructor status updated successfully.',
      instructor: updatedInstructor
    });
  } catch (error) {
    console.error(`Error updating instructor status: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};