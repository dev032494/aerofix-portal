const db = require('../models');

const createTaskCard = async (req, res, next) => {
  try {
    const taskCard = await db.TaskCard.create(req.body);
    res.status(201).json({ status: 'success', data: { taskCard } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTaskCard };