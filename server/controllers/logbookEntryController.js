const logbookEntryRepository = require('../repositories/logbookEntryRepository');

const createLogEntry = async (req, res, next) => {
  // #swagger.tags = ['Logbook Entries']
  // #swagger.description = 'Appends a certified maintenance entry log onto an aircraft.'
  /* #swagger.parameters['obj'] = {
        in: 'body',
        required: true,
        schema: { aircraft_id: 1, logbook_type: 'airframe', entry_date: '2026-05-20', tach_time: 1420.30, total_time: 3200.10, mechanic_name: 'John Doe', certificate_number: 'AP334125M' }
  } */
  try {
    if (!req.body.aircraft_id || !req.body.mechanic_name) {
      res.status(400);
      throw new Error('Logbook initialization blocked. Core signatory parameters absent.');
    }
    const logEntry = await logbookEntryRepository.create(req.body);
    res.status(201).json({ status: 'success', data: { logEntry } });
  } catch (error) { next(error); }
};

module.exports = { createLogEntry };