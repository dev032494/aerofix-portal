const express = require('express');
const router = express.Router();
const TaskDetailController = require('../controllers/taskDetailController');
const TaskItemController = require('../controllers/taskItemController');

// Task Detail Routes
router.post('/task-details', TaskDetailController.createTaskDetail);
router.get('/task-details/:id', TaskDetailController.getTaskDetail);
router.get('/task-details', TaskDetailController.getTaskDetailList);

// Task Item Routes
router.post('/task-items', TaskItemController.createTaskItem);
router.get('/task-items/:id', TaskItemController.getTaskItem);

module.exports = router;