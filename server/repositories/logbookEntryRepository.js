const BaseRepository = require('./baseRepository');
const db = require('../models');

class LogbookEntryRepository extends BaseRepository {
  constructor() {
    super(null);
  }

  get model() {
    return db.LogbookEntry;
  }

  async findByAircraftId(aircraft_id) {
    return await this.model.findAll({ 
      where: { aircraft_id },
      order: [['entry_date', 'DESC']]
    });
  }
}

module.exports = new LogbookEntryRepository();