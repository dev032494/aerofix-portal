const TaskDetailRepository = require('../repositories/taskDetailRepository');

exports.createTaskDetail = async (req, res) => {
  try {
    const taskDetail = await TaskDetailRepository.create(req.body);
    res.status(201).json(taskDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTaskDetailList = async (req, res) => {
    try {
        const data = await TaskDetailRepository.findAll();
        res.status(200).json(data);

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}

exports.getTaskDetail = async (req, res) => {
  try {
    const taskDetail = await TaskDetailRepository.findById(req.params.id);
    if (!taskDetail) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(taskDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};