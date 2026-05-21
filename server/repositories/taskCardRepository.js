const BaseRepository = require('./baseRepository');
const db = require('../models');

class TaskCardRepository extends BaseRepository {
  constructor() {
    super(null);
  }

  get model() {
    return db.TaskCard;
  }

  async findByWorkOrderId(work_order_id) {
    return await this.model.findAll({ where: { work_order_id } });
  }
}

module.exports = new TaskCardRepository();