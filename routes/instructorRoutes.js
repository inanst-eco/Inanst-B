const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');


router.get('/dashboard', instructorController.getInstructorDashboard);

module.exports = router;