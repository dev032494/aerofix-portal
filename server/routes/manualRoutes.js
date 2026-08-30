const express = require('express');
const router = express.Router();
const ManualDetailController = require('../controllers/manualDetailController');
const ManualItemController = require('../controllers/manualItemController');

// Manual Detail Routes
router.post('/manual-details', ManualDetailController.createManualDetail);
router.get('/manual-details', ManualDetailController.getManualDetailList);
router.get('/manual-details/:id', ManualDetailController.getManualDetail);

// Manual Item Routes
router.post('/manual-items', ManualItemController.createManualItem);
router.get('/manual-items/:id', ManualItemController.getManualItem);

module.exports = router;