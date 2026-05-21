const BaseRepository = require('./baseRepository');
const db = require('../models');

class AdComplianceRepository extends BaseRepository {
  constructor() {
    super(null);
  }

  get model() {
    return db.AdCompliance;
  }

  async findByAdNumber(ad_number) {
    return await this.model.findAll({ where: { ad_number } });
  }
}

module.exports = new AdComplianceRepository();