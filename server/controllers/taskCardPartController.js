const db = require('../models');

const addPartRequirement = async (req, res, next) => {
  try {
    // ⚡ Safe Model Resolver Layer
    const TaskCardPart = db.TaskCardPart || db.taskCardPart || db.task_card_part || db.TaskCardParts;

    if (!TaskCardPart) {
      return res.status(500).json({
        status: 'error',
        message: 'Sequelize Registry Error: TaskCardPart model is unresolvable. Current keys: ' + Object.keys(db).join(', ')
      });
    }

    const { part_number, description, quantity_required, task_card_id } = req.body;

    const part = await TaskCardPart.create({
      part_number,
      description,
      quantity_required,
      task_card_id: task_card_id || req.body.taskCardId
    });

    res.status(201).json({ status: 'success', data: { part } });
  } catch (error) {
    next(error);
  }
};

module.exports = { addPartRequirement };