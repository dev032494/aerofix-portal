const express = require('express');
const router = express.Router();
const AircraftController = require('../controllers/AircraftController');

router.post('/', AircraftController.create);
router.get('/', AircraftController.getAll);
router.get('/:id', AircraftController.getById);
router.put('/:id', AircraftController.update);
router.delete('/:id', AircraftController.delete);

module.exports = router;