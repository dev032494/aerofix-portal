const AircraftRepository = require('../repositories/AircraftRepository');


exports.create = async (req, res) => {
  try {
    const result = await AircraftRepository.create(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    return res.status(201).json(result.data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const aircrafts = await AircraftRepository.findAll();
    res.status(200).json(aircrafts);
  } catch (error) {
    console.error(`Error fetching aircraft: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}

exports.getById = async (req, res) => {
  try {
    const aircraft = await AircraftRepository.findById(req.params.id);
    if (!aircraft) {
      return res.status(404).json({ message: 'Aircraft not found' });
    }
    res.status(200).json(aircraft);
  } catch (error) {
    console.error(`Error fetching aircraft: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}

exports.update = async (req, res) => {
  try {
    const aircraft = await AircraftRepository.update(req.params.id, req.body);
    if (!aircraft) {
      return res.status(404).json({ message: 'Aircraft not found' });
    }
    res.status(200).json(aircraft);
  } catch (error) {
    console.error(`Error updating aircraft: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}

exports.delete = async (req, res) => {
  try {
    const deleted = await AircraftRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Aircraft not found' });
    }
    res.status(204).send(); // 204 No Content for successful deletion
  } catch (error) {
    console.error(`Error deleting aircraft: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}
