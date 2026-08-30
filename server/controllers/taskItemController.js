const TaskItemRepository = require('../repositories/taskItemRepository');

exports.createTaskItem = async (req, res) => {
  try {
    const taskItem = await TaskItemRepository.create(req.body);
    res.status(201).json(taskItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTaskItem = async (req, res) => {
  try {
    const taskItem = await TaskItemRepository.findByTaskDetailId(req.params.id);
    if (!taskItem) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(taskItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};