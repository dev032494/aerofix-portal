const ManualDetailRepository = require('../repositories/manualDetailRepository');

exports.createManualDetail = async (req, res) => {
  try {
    const manualDetail = await ManualDetailRepository.create(req.body);
    res.status(201).json(manualDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getManualDetailList = async (req, res) => {
  try {
    const data = await ManualDetailRepository.findAll();
    res.status(200).json(data);

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

exports.getManualDetail = async (req, res) => {
  try {
    const manualDetail = await ManualDetailRepository.findById(req.params.id);
    if (!manualDetail) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(manualDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};