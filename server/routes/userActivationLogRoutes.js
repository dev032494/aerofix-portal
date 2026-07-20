const express = require('express');
const router = express.Router();
const logController = require('../controllers/userActivationLogController');

// REST API Endpoints
router.post('/', logController.processApproval);
router.get('/', logController.getGlobalHistory);

module.exports = router;