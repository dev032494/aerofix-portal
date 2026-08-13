const BaseRepository = require('./BaseRepository');
const db = require('../models');

class AircraftRepository extends BaseRepository {
  constructor() {
    super(db.Aircraft);
  }

  // ---------------------------------------------------------
  // Core CRUD Overrides
  // ---------------------------------------------------------

  /**
     * Create a new aircraft with duplicate registration validation
     */
  async create(data) {
    const regNumber = data.a_registration_number || data.registration_number;
    const existingAircraft = await this.findByRegistration(regNumber);

    // Handles arrays, single objects, or truthy query results robustly
    const isDuplicate = Array.isArray(existingAircraft)
      ? existingAircraft.length > 0
      : Boolean(existingAircraft);

    if (isDuplicate) {
      return { success: false, message: `Aircraft with registration number '${regNumber}' already exists.` };
    }

    try {
      const result = await super.create(data);
      return { success: true, data: result };
    } catch (error) {
      // Catches database-level unique constraint violations (Race conditions)
      if (
        error.code === 'ER_DUP_ENTRY' ||
        error.code === '23505' ||
        (error.message && error.message.toLowerCase().includes('duplicate'))
      ) {
        return { success: false, message: `Aircraft with registration number '${regNumber}' already exists.` };
      }
      return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
  }

  /**
   * Retrieve all aircraft
   */
  async findAll(options = {}) {
    const mergedOptions = {
      order: [['a_registration_number', 'ASC']],
      ...options
    };
    return await super.findAll(mergedOptions);
  }

  /**
   * Retrieve a single aircraft by its ID
   */
  async findById(id, options = {}) {
    return await super.findById(id, options);
  }

  /**
   * Update an existing aircraft
   */
  async update(id, data) {
    return await super.update(id, data);
  }

  /**
   * Delete an aircraft
   */
  async delete(id) {
    return await super.delete(id);
  }

  // ---------------------------------------------------------
  // Custom Aircraft-Specific Queries
  // ---------------------------------------------------------

  /**
     * Find an aircraft specifically by its registration number
     */
  async findByRegistration(registrationNumber) {
    return await super.findOne({
      where: { a_registration_number: registrationNumber }
    });
  }
}

// Export a single instance of the repository
module.exports = new AircraftRepository();