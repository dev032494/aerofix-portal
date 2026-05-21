const recurringInspectionRepository = require('../repositories/recurringInspectionRepository');

const createInspectionSchedule = async (req, res, next) => {
  // #swagger.tags = ['Inspections']
  // #swagger.description = 'Maps an upcoming maintenance calendar task or hour limit.'
  /* #swagger.parameters['obj'] = {
        in: 'body',
        required: true,
        schema: { aircraft_id: 1, inspection_type: '100-Hour Inspection', interval_hours: 100.00, next_due_tech: 1520.30 }
  } */
  try {
    const inspection = await recurringInspectionRepository.create(req.body);
    res.status(201).json({ status: 'success', data: { inspection } });
  } catch (error) { next(error); }
};

module.exports = { createInspectionSchedule };