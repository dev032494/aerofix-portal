const express = require('express');
const router = express.Router();

// Import Unified Sub-Routers
const userRoutes = require('./userRoutes');
const aircraftRoutes = require('./aircraftRoutes');
const workOrderRoutes = require('./workOrderRoutes');
// const libraryRouter = require('./libraryRoutes');
const documentRoutes = require('./documentRoutes'); // ⚡ ADDED: Import new document sub-router
const userActivationLogRoutes = require('./userActivationLogRoutes'); // ⚡ ADDED: Import new user activation log sub-router
const activityLogRoutes = require('./activityLogRoutes'); // ⚡ ADDED: Import new activity log sub-router


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
// router.use('/library', libraryRouter);

// ⚡ ADDED: Document Indexing & Table of Contents Sub-System -> Maps to /api/v1/documents
router.use('/documents', documentRoutes);

// ⚡ ADDED: User Activation Log Sub-System -> Maps to /api/v1/activation-logs
router.use('/activation-logs', userActivationLogRoutes);

router.use('/activity-logs', activityLogRoutes); // ⚡ ADDED: Activity Log Sub-System

module.exports = { apiRouter: router };