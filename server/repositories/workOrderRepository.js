const db = require('../models');

class WorkOrderRepository {
  async create(data) {
    return await db.WorkOrder.create(data);
  }

  async findAllSummary() {
    // Dynamically fallback if an association alias is pluralized differently
    const taskCardModel = db.TaskCard || db.taskcard;
    const taskCardAlias = db.WorkOrder.associations.taskCards ? 'taskCards' : 'taskcards';

    return await db.WorkOrder.findAll({
      include: taskCardModel ? [
        {
          model: taskCardModel,
          as: taskCardAlias,
          attributes: ['id']
        }
      ] : [],
      order: [['opened_date', 'DESC']]
    });
  }

  /**
   * ⚡ FIXES THE EXCEPTION: Safe lookups for Step and Part configurations
   */
  async findProgressTree(id) {
    // Resolve runtime model references safely to handle casing drops
    const TaskCard = db.TaskCard || db.taskcard;
    const Step = db.Step || db.step || db.TaskCardStep;
    const Part = db.Part || db.part || db.TaskCardPart;

    // Detect active structural alias bindings configured in your models
    const taskCardAlias = db.WorkOrder.associations.taskCards ? 'taskCards' : 'taskcards';
    const stepAlias = TaskCard?.associations?.steps ? 'steps' : 'taskCardSteps';
    const partAlias = TaskCard?.associations?.parts ? 'parts' : 'taskCardParts';

    const innerIncludes = [];
    if (Step) innerIncludes.push({ model: Step, as: stepAlias });
    if (Part) innerIncludes.push({ model: Part, as: partAlias });

    return await db.WorkOrder.findByPk(id, {
      include: TaskCard ? [
        {
          model: TaskCard,
          as: taskCardAlias,
          include: innerIncludes
        }
      ] : [],
      order: TaskCard ? [
        [{ model: TaskCard, as: taskCardAlias }, 'id', 'ASC']
      ] : []
    });
  }
}

module.exports = new WorkOrderRepository();