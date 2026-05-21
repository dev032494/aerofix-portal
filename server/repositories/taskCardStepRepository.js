const BaseRepository = require('./baseRepository');
const db = require('../models');

class TaskCardStepRepository extends BaseRepository {
  constructor() {
    super(null);
  }

  get model() {
    return db.TaskCardStep;
  }

  async findOrderedSteps(task_card_id) {
    return await this.model.findAll({
      where: { task_card_id },
      order: [['step_order', 'ASC']]
    });
  }
}

module.exports = new TaskCardStepRepository();