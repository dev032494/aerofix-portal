const BaseRepository = require('./baseRepository');
const db = require('../models');

class EngineRepository extends BaseRepository {
  constructor() {
    super(null); // Will resolve dynamically below
  }

  // Override model getter to bypass loading order race conditions
  get model() {
    return db.Engine;
  }

  async findActiveByAircraftId(aircraft_id) {
    return await this.model.findAll({ where: { aircraft_id, is_active: true } });
  }
}

module.exports = new EngineRepository();