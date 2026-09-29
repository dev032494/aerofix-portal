const WorkOrderListRepository = require('../repositories/workOrderListRepository');

exports.getAll = async (req, res) => {
  try {
    const data = await WorkOrderListRepository.findAll();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await WorkOrderListRepository.create(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.status(201).json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await WorkOrderListRepository.update(req.params.id, req.body);
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    res.status(200).json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const result = await WorkOrderListRepository.updateStatus(req.params.id, 'deleted');
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    res.status(200).json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRestore = async (req, res) => {
  try {
    const result = await WorkOrderListRepository.updateStatus(req.params.id, 'active');
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    res.status(200).json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await WorkOrderListRepository.delete(req.params.id);
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActive = async (req, res) => {
  try {
    const data = await WorkOrderListRepository.findAllActive();

    console.log('This is the data', data);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};