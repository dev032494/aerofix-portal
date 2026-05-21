const BaseRepository = require('./baseRepository');
const { RecurringInspection } = require('../models');

class RecurringInspectionRepository extends BaseRepository {
  constructor() {
    super(RecurringInspection);
  }

  async findOverdueInspections(currentDate) {
    const { Op } = require('sequelize');
    return await this.model.findAll({
      where: {
        next_due_date: { [Op.lte]: currentDate }
      }
    });
  }
}

module.exports = new RecurringInspectionRepository();