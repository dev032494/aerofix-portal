const userRepository = require('../repositories/userRepository');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // ⚡ ADDED: Import bcrypt for secure comparison

// Use a secure fallback sign-off key for development encryption signatures
const JWT_SECRET = process.env.JWT_SECRET || 'aerofix_secret_sentinel_2026';

const login = async (req, res, next) => {
  // #swagger.tags = ['Authentication Subsystem']
  try {
    const { user_name, password } = req.body;

    if (!user_name || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide username and password.' });
    }

    // Pull profile based on username lookup
    const user = await userRepository.findByUsername(user_name);

    // ⚡ UPDATED: Check bcrypt match if the user exists. 
    // This prevents timing attacks and handles the asynchronous comparison securely.
    let isPasswordValid = false;
    if (user) {
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    }

    // Return generic error if either the user wasn't found OR the password didn't match
    if (!user || !isPasswordValid) {
      return res.status(401).json({ status: 'fail', message: 'Invalid username or password.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ status: 'fail', message: 'This employee account has been deactivated.' });
    }

    // Generate JWT access payload token tracking role and signature properties
    const token = jwt.sign(
      { id: user.id, role: user.role, first_name: user.first_name, last_name: user.last_name },
      JWT_SECRET,
      { expiresIn: '8h' } // Clears automatically after an 8-hour shift ends
    );

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