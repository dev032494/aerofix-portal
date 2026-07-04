const BaseRepository = require('./baseRepository');
const db = require('../models'); // Import the central db registry object

class UserRepository extends BaseRepository {
  constructor() {
    // Pass null up to super so it doesn't try to assign an undefined value early
    super(null);
  }

  // Dynamic getter guarantees db.User is evaluated ONLY when an API endpoint is hit
  get model() {
    return db.User;
  }

  /**
   * Finds a user profile by their registered email address
   * @param {string} email 
   */
  async findByEmail(email) {
    return await this.model.findOne({ where: { email } });
  }

  /**
   * Finds a user profile by their unique username
   * @param {string} userName 
   */
  async findByUsername(userName) {
    return await this.model.findOne({ where: { user_name: userName } });
  }

  /**
   * Retrieves all users while safely excluding critical security hashes from the dataset
   */
  async findAllSafe() {
    return await this.model.findAll({
      attributes: { 
        exclude: ['password_hash'] // Updated: signature_pin_hash was removed from the new schema
      }
    });
  }
}

module.exports = new UserRepository();