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
const instructorRoutes = require('./instructorRoutes'); // ⚡ ADDED: Import new instructor sub-router
const workOrderListRoutes = require('./workOrderListRoutes'); // ⚡ ADDED: Import new work order list sub-router
const taskRoutes = require('./taskRoutes'); // ⚡ ADDED: Import new task sub-router
const manualRoutes = require('./manualRoutes'); // ⚡ ADDED: Import new manual sub-router
const maintenanceSchedulePlanningRoutes = require('./maintenanceSchedulePlanningRoutes'); // ⚡ ADDED: Import new maintenance schedule sub-router
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

// ⚡ ADDED: Instructor Management Sub-System -> Maps to /api/v1/instructors
router.use('/instructors', instructorRoutes);

// ⚡ ADDED: Work Order List Management Sub-System -> Maps to /api/v1/work-order-list
router.use('/work-order-list', workOrderListRoutes);

// ⚡ ADDED: Task Management Sub-System -> Maps to /api/v1/task
router.use('/task', taskRoutes);

// ⚡ ADDED: Manual Management Sub-System -> Maps to /api/v1/manual
router.use('/manual', manualRoutes);

// ⚡ ADDED: Maintenance Schedule Management Sub-System -> Maps to /api/v1/maintenance-schedule
router.use('/maintenance-schedule', maintenanceSchedulePlanningRoutes);

module.exports = { apiRouter: router };