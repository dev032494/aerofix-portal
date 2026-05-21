const adComplianceRepository = require('../repositories/adComplianceRepository');

const logAdCompliance = async (req, res, next) => {
  // #swagger.tags = ['AD Compliance']
  // #swagger.description = 'Signs off a safety Airworthiness Directive verification check against an airframe.'
  /* #swagger.parameters['obj'] = {
        in: 'body',
        required: true,
        schema: { aircraft_id: 1, ad_number: 'AD 2024-12-05', subject: 'Wing Spar Inspection', method_of_compliance: 'Eddy current check performed per SB-102.' }
  } */
  try {
    const compliance = await adComplianceRepository.create(req.body);
    res.status(201).json({ status: 'success', data: { compliance } });
  } catch (error) { next(error); }
};

module.exports = { logAdCompliance };