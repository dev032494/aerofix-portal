const BaseRepository = require('./baseRepository');
const db = require('../models'); // Import the main db registry object

class TaskCardPartRepository extends BaseRepository {
  constructor() {
    // Pass null up to super so it doesn't break due to child getters initialization
    super(null);
  }

  // Dynamic getter guarantees db.TaskCardPart is evaluated ONLY when called
  get model() {
    return db.TaskCardPart;
  }

  /**
   * Retrieves all part requirement allocations for a specific task card that haven't been issued yet
   * @param {number} task_card_id - The primary key of the target Task Card
   */
  async findPendingPartsByTask(task_card_id) {
    return await this.model.findAll({ 
      where: { 
        task_card_id, 
        is_issued: false 
      } 
    });
  }

  /**
   * Optional Helper: Quickly fetch full parts breakdown along with parent Task Card context details
   * @param {number} partId - Primary key of the allocated part entry
   */
  async getPartWithTaskContext(partId) {
    return await this.model.findByPk(partId, {
      include: [{
        model: db.TaskCard,
        as: 'taskCard'
      }]
    });
  }
}

module.exports = new TaskCardPartRepository();