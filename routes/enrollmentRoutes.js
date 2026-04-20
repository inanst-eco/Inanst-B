const express = require('express');
const router = express.Router();
const ctrl = require('./enrollmentController');

// Public
router.post('/register', ctrl.registerAndPay);
router.get('/status', async (req, res) => {
  const { Setting } = require('./enrollmentModel');
  const settings = await Setting.findOne();
  res.json({ running: settings?.isEnrollmentOpen });
});

// Admin/Worker Only
router.patch('/approve/:id', ctrl.approveStudent);
router.patch('/withdraw/:id', ctrl.withdrawStudent);
router.post('/toggle-admission', ctrl.toggleAdmission);

module.exports = router;