const express = require('express');
const router = express.Router();
const workOrderListController = require('../controllers/workOrderListController');

router.get('/', workOrderListController.getAll);
router.post('/', workOrderListController.create);
router.put('/:id', workOrderListController.update);
router.delete('/:id', workOrderListController.delete);

module.exports = router;