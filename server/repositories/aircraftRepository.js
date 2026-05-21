const BaseRepository = require('./baseRepository');
const db = require('../models');

class AircraftRepository extends BaseRepository {
  constructor() {
    super(null);
  }

  get model() {
    return db.Aircraft;
  }

  /**
   * Fetches all registered aircraft with aggregated counts of mounted engines
   */
  async findAllSummary() {
    return await this.model.findAll({
      include: [
        {
          model: db.Engine,
          as: 'engines',
          attributes: ['id'] // Pull only IDs to keep queries ultra-lightweight
        }
      ],
      order: [['tail_number', 'ASC']]
    });
  }

  async findProfileWithSubsystems(id) {
    return await this.model.findByPk(id, {
      include: [
        { model: db.Engine, as: 'engines' },
        { model: db.RecurringInspection, as: 'inspections' },
        { model: db.AdCompliance, as: 'compliances' }
      ]
    });
  }
}

module.exports = new AircraftRepository();