const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');

// ⚡ CADRE MANAGEMENT ENDPOINTS
router.get('/', instructorController.getAllInstructors);
router.get('/:id', instructorController.getInstructorById);
router.post('/', instructorController.createInstructor);
router.put('/:id', instructorController.updateInstructor);
router.delete('/:id', instructorController.deleteInstructor);
router.patch('/:id/status', instructorController.updateStatus); // ⚡ STATUS TOGGLE ENDPOINT

// ⚡ STATUS TOGGLE ENDPOINT (Matches api.patch('/instructors/:id/status'))
// router.patch('/:id/status', instructorController.updateStatus);

module.exports = router;