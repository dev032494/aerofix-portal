const express = require('express');
const router = express.Router();

// Import Target Controllers
const workOrderCtrl = require('../controllers/workOrderController');
const taskCardCtrl = require('../controllers/taskCardController');
const partCtrl = require('../controllers/taskCardPartController');
const stepCtrl = require('../controllers/taskCardStepController');

// Master Maintenance Control Endpoints
router.get('/', workOrderCtrl.getAllWorkOrders);
router.post('/', workOrderCtrl.createWorkOrder);
router.get('/:id/progress', workOrderCtrl.getWorkOrderProgress);

// Child Execution Planning Allocation Operations
router.post('/task-cards', taskCardCtrl.createTaskCard);
router.post('/parts', partCtrl.addPartRequirement);
router.post('/steps', stepCtrl.addInstructionStep);

module.exports = router;