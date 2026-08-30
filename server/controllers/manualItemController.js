const ManualItemRepository = require('../repositories/manualItemRepository');

exports.createManualItem = async (req, res) => {
  try {
    const manualItem = await ManualItemRepository.create(req.body);
    res.status(201).json(manualItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getManualItem = async (req, res) => {
  try {
    const manualItem = await ManualItemRepository.findByManualDetailId(req.params.id);
    if (!manualItem) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(manualItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};