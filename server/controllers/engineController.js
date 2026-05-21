const engineRepository = require('../repositories/engineRepository');

const addEngine = async (req, res, next) => {
  // #swagger.tags = ['Engines']
  // #swagger.description = 'Installs an engine log record onto a target aircraft.'
  /* #swagger.parameters['obj'] = {
        in: 'body',
        required: true,
        schema: { aircraft_id: 1, make_model: 'Lycoming IO-360', serial_number: 'L-25410-A', installed_date: '2024-05-12' }
  } */
  try {
    if (!req.body.aircraft_id || !req.body.serial_number) {
      res.status(400);
      throw new Error('Engine initialization failed. Missing structural parameters.');
    }
    const engine = await engineRepository.create(req.body);
    res.status(201).json({ status: 'success', data: { engine } });
  } catch (error) { next(error); }
};

module.exports = { addEngine };