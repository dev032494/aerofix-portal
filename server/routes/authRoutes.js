const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const otpCtrl = require('../controllers/OtpController'); // ⚡ ADDED: Imports the OTP handler directly

// Existing authentication handling pipeline
router.post('/login', authCtrl.login);

// 🔒 SECURITY EDGE CHECKPOINT: 
// Dispatches the validation sequence challenge to candidate emails prior to final account write operations.
router.post('/send-otp', otpCtrl.sendOtp);

module.exports = router;