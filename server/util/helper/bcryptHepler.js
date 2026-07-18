import bcrypt from 'bcrypt';

// 10 salt rounds is the industry standard—secure yet fast.
const SALT_ROUNDS = 10;

/**
 * Hashes a plain text password.
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} The securely hashed password.
 */
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Error hashing the password: ' + error.message);
  }
};

/**
 * Compares a plain text password with a stored hash to verify if they match.
 * @param {string} password - The plain text password candidate.
 * @param {string} hashedPassword - The hashed password stored in your database.
 * @returns {Promise<boolean>} True if the password is correct, false otherwise.
 */
export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Error comparing passwords: ' + error.message);
  }
};