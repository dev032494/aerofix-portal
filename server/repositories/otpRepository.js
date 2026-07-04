// repositories/OtpRepository.js
const { Op } = require('sequelize');

// ⚡ FIX: Pull your Sequelize instance directly to avoid index race conditions
const sequelize = require('../models').sequelize; 

// ⚡ FIX: Directly extract the Model model constructor wrapper
// If your model file is located at models/otp.js, import it directly:
const Otp = require('../models/otp')(sequelize); 

class OtpRepository {
  /**
   * Generate and save a new 6-digit OTP code lasting 15 minutes.
   */
  async createForEmail(email) {
    // This will now execute perfectly without being undefined!
    await Otp.update(
      { is_verified: true },
      { where: { email, is_verified: false } }
    );

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 15 * 60 * 1000); 

    return await Otp.create({
      email,
      code,
      expires_at,
      is_verified: false
    });
  }

  async verifyCode(email, code) {
    const record = await Otp.findOne({
      where: { 
        email, 
        code,
        is_verified: false,
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (!record) return false;

    record.is_verified = true;
    await record.save();
    return true;
  }
}

module.exports = new OtpRepository();