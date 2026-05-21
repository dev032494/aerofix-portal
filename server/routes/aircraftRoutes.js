const express = require('express');
const router = express.Router();

const aircraftCtrl = require('../controllers/aircraftController');
const engineCtrl = require('../controllers/engineController');
const logbookCtrl = require('../controllers/logbookEntryController');
const inspectionCtrl = require('../controllers/recurringInspectionController');
const complianceCtrl = require('../controllers/adComplianceController');

// ✈️ Core Aircraft Fleet Operational Endpoints
router.get('/', aircraftCtrl.getAllAircraft);            // ⚡ ADDED: Maps GET /api/v1/aircraft
router.post('/', aircraftCtrl.createAircraft);          // Maps POST /api/v1/aircraft
router.get('/:id/dashboard', aircraftCtrl.getAircraftDashboard); // Maps GET /api/v1/aircraft/:id/dashboard

// 🔩 Fleet Sub-System Child Injectors
router.post('/engines', engineCtrl.addEngine);
router.post('/logbook-entries', logbookCtrl.createLogEntry);
router.post('/inspections', inspectionCtrl.createInspectionSchedule);
router.post('/ad-compliance', complianceCtrl.logAdCompliance);

module.exports = router;