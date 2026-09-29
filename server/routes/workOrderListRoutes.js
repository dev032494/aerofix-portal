const express = require('express');
const router = express.Router();
const workOrderListController = require('../controllers/workOrderListController');

router.get('/', workOrderListController.getAll);
router.post('/', workOrderListController.create);
router.put('/:id', workOrderListController.update);
router.delete('/:id', workOrderListController.delete);
router.put('/delete/:id', workOrderListController.updateStatus);
router.put('/restore/:id', workOrderListController.updateRestore);
router.get('/active', workOrderListController.getActive);

module.exports = router;