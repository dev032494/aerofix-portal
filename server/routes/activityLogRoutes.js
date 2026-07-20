const express = require('express');
const router = express.Router();
const activityLogCtrl = require('../controllers/activityLogController');

router.get('/', activityLogCtrl.getLogs);
router.get('/modules', activityLogCtrl.getModules);
router.post('/', activityLogCtrl.logActivity);

module.exports = router;