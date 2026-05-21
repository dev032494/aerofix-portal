const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');

router.get('/', userCtrl.getAllUsers);
router.post('/', userCtrl.createNewUserProfile);

// ⚡ Profile Configuration Tracks Map Handlers
router.put('/:id/profile', userCtrl.updateProfileData);
router.put('/:id/password', userCtrl.updateAccountPassword);

module.exports = router;