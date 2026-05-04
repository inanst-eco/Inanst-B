const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');


// Admin Routes
router.post('/create', taskController.createTask);
router.get('/all', taskController.getAllTasks);
router.delete('/delete/:id', taskController.deleteTask);

// Staff Routes
router.get('/assigned/:staffId', taskController.getMyTasks);
router.patch('/update-status', taskController.updateTaskStatus);

module.exports = router;