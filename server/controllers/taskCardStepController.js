const db = require('../models');

const addInstructionStep = async (req, res, next) => {
  try {
    // ⚡ Safe Model Resolver Layer
    const TaskCardStep = db.TaskCardStep || db.taskCardStep || db.task_card_step || db.TaskCardSteps;
    
    if (!TaskCardStep) {
      return res.status(500).json({
        status: 'error',
        message: 'Sequelize Registry Error: TaskCardStep model is unresolvable. Current keys: ' + Object.keys(db).join(', ')
      });
    }

    const { step_order, torque_spec, instruction, task_card_id } = req.body;

    const step = await TaskCardStep.create({
      step_order,
      torque_spec,
      instruction,
      task_card_id: task_card_id || req.body.taskCardId
    });

    res.status(201).json({ status: 'success', data: { step } });
  } catch (error) {
    next(error);
  }
};

module.exports = { addInstructionStep };