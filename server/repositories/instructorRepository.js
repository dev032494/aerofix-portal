const models = require('../models'); // Imports initialized models (db.Instructor)
const Instructor = models.Instructor || require('../models/Instructor');
const BaseRepository = require('./baseRepository');

class InstructorRepository extends BaseRepository {
  constructor() {
    // Ensure we pass the evaluated model instance, not a factory function
    const modelInstance = typeof Instructor === 'function' && models.Instructor 
      ? models.Instructor 
      : Instructor;
      
    super(modelInstance);
  }

  /**
   * Create a new instructor record with default active status
   * @param {object} data 
   * @param {object} options 
   */
  async create(data, options = {}) {
    const payload = {
      ...data,
      i_status: data.i_status ?? true
    };
    return await super.create(payload, options);
  }

  /**
   * Find an instructor by their unique CAA license number
   * @param {string} licenseNumber 
   * @param {object} options 
   */
  async findByLicenseNumber(licenseNumber, options = {}) {
    const { where, ...restOptions } = options;
    return await this.currentModel.findOne({
      where: { 
        i_license_number: licenseNumber,
        ...where 
      },
      ...restOptions,
    });
  }

  /**
   * Toggle or update the active state of an instructor
   * @param {number|string} id 
   * @param {boolean} isActive 
   * @param {object} options 
   */
  async updateStatus(id, isActive, options = {}) {
    return await this.update(id, { i_status: isActive }, options);
  }

  /**
   * Retrieve all active instructors
   * @param {object} options 
   */
  async findActiveInstructors(options = {}) {
    const { where, ...restOptions } = options;
    return await this.currentModel.findAll({
      where: { 
        i_status: true,
        ...where 
      },
      ...restOptions,
    });
  }
}

module.exports = new InstructorRepository();