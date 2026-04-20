const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/enrollmentController');

// Public
router.post('/register', ctrl.registerAndPay);
router.get('/status', ctrl.getEnrollmentStatus);

// Admin/Worker Only
router.patch('/approve/:id', ctrl.approveStudent);
router.patch('/withdraw/:id', ctrl.withdrawStudent);
router.post('/toggle-admission', ctrl.toggleAdmission);

module.exports = router;