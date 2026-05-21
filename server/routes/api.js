const express = require('express');
const router = express.Router();

// Import Unified Sub-Routers
const userRoutes = require('./userRoutes');
const aircraftRoutes = require('./aircraftRoutes');
const workOrderRoutes = require('./workOrderRoutes');
const libraryRouter = require('./libraryRoutes');


// =========================================================================
// GATEWAY CORE ROUTING ROUTE ROUTE PIPELINES
// =========================================================================

// Users Sub-System -> Maps to /api/v1/users
router.use('/users', userRoutes);

// Aircraft & Fleet Operations -> Maps to /api/v1/aircraft
router.use('/aircraft', aircraftRoutes);

// Maintenance Pipeline Management -> Maps to /api/v1/work-orders
router.use('/work-orders', workOrderRoutes);

// Technical Publications Library -> Maps to /api/v1/library
router.use('/library', libraryRouter);

module.exports = { apiRouter: router };