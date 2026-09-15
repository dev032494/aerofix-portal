const express = require('express');
const router = express.Router();
const logbookController = require('../controllers/logbookController')


router.post('/', logbookController.createLogbook);
router.get('/', logbookController.getAllLogbooks);
router.get('/no-logbooks', logbookController.getWorkOrders);
router.get('/:id', logbookController.getLogbookById);
router.delete('/:id', logbookController.deleteLogbook);


module.exports = router;