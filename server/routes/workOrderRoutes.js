const express = require('express');
const router = express.Router();

const workOrderController = require('../controllers/workOrderController');

router.get('/', workOrderController.getAllWorkOrders);
router.post('/', workOrderController.createWorkOrder);
router.get('/view-details/:id',workOrderController.getWorkOrderDetails);
router.get('/student/:id', workOrderController.studentTask);
router.put('/start-task/:id', workOrderController.startTask);
router.put('/report/:id', workOrderController.reportTask);
router.get('/view-report/:id', workOrderController.viewReport);
router.get('/complete', workOrderController.getCompleteWorkOrders);


module.exports = router;