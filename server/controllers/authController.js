const userRepository = require('../repositories/userRepository');
const activityLogRepository = require('../repositories/activityLogRepository'); // ⚡ ADDED: Audit log repository
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'aerofix_secret_sentinel_2026';

const login = async (req, res, next) => {
  // #swagger.tags = ['Authentication Subsystem']
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  try {
    const { user_name, password } = req.body;

    if (!user_name || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide username and password.' });
    }

    // Pull profile based on username lookup
    const user = await userRepository.findByUsername(user_name);

    // Secure bcrypt verification
    let isPasswordValid = false;
    if (user) {
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    }

    // Handle invalid credentials
    if (!user || !isPasswordValid) {
      // ⚡ LOG: Log failed authentication attempt
      await activityLogRepository.createLog({
        userId: user ? user.id : null,
        action: 'USER_LOGIN_FAILED',
        module: 'AUTH',
        description: `Failed login attempt for username: [${user_name}] - Invalid credentials`,
        ipAddress,
        userAgent,
        method: req.method,
        path: req.originalUrl,
        statusCode: 401
      });

      return res.status(401).json({ status: 'fail', message: 'Invalid username or password.' });
    }

    // Handle inactive accounts
    if (!user.is_active) {
      // ⚡ LOG: Log inactive user blocked attempt
      await activityLogRepository.createLog({
        userId: user.id,
        action: 'USER_LOGIN_BLOCKED',
        module: 'AUTH',
        description: `Blocked login attempt for inactive user account ID: [${user.id}] (${user.email})`,
        ipAddress,
        userAgent,
        method: req.method,
        path: req.originalUrl,
        statusCode: 403
      });

      return res.status(403).json({ status: 'fail', message: 'Your account is not yet activated. Please contact administrator' });
    }

    // Generate JWT access payload token
    const token = jwt.sign(
      { id: user.id, role: user.role, first_name: user.first_name, last_name: user.last_name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // ⚡ LOG: Record successful shift authentication log entry
    await activityLogRepository.createLog({
      userId: user.id,
      action: 'USER_LOGIN_SUCCESS',
      module: 'AUTH',
      description: `User [${user.first_name} ${user.last_name}] logged in successfully with role [${user.role}].`,
      ipAddress,
      userAgent,
      method: req.method,
      path: req.originalUrl,
      statusCode: 200
    });

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          certificate_number: user.certificate_number
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };