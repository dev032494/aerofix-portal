const aircraftRepository = require('../repositories/aircraftRepository');

/**
 * Retrieves a lightweight listing summary of all registered airframes
 */
const getAllAircraft = async (req, res, next) => {
  // #swagger.tags = ['Aircraft Fleet Management']
  try {
    const aircraft = await aircraftRepository.findAllSummary();
    res.status(200).json({
      status: 'success',
      data: { aircraft }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves the full detail payload (subsystems, inspections, AD logs) for a single aircraft
 */
const getAircraftDashboard = async (req, res, next) => {
  // #swagger.tags = ['Aircraft Fleet Management']
  try {
    const { id } = req.params;
    const profile = await aircraftRepository.findProfileWithSubsystems(id);
    
    if (!profile) {
      return res.status(404).json({
        status: 'fail',
        message: 'No airframe asset found matching that identifier pointer.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a brand new aircraft asset record root node
 */
const createAircraft = async (req, res, next) => {
  // #swagger.tags = ['Aircraft Fleet Management']
  try {
    const aircraft = await aircraftRepository.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { aircraft }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAircraft,
  getAircraftDashboard,
  createAircraft
};