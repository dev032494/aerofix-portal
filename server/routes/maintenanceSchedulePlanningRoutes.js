const express = require('express');
const router = express.Router();
const MaintenanceSchedulePlanningController = require('../controllers/maintenanceSchedulePlanningController');

// Maintenance Schedule Routes
router.post('/maintenance-schedule', MaintenanceSchedulePlanningController.createMaintenanceSchedule);
router.get('/maintenance-schedule', MaintenanceSchedulePlanningController.getMaintenanceScheduleList);
router.get('/maintenance-schedule/:id', MaintenanceSchedulePlanningController.getMaintenanceSchedule);


module.exports = router;